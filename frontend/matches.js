import { db, collection, getDocs } from "./firebase.js";

const formatPrice = price =>
  Number(price || 0).toLocaleString("en-KE");

const makeElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

export async function loadMatches() {
  const container = document.getElementById("matches");

  if (!container) {
    console.error('Could not find an element with id="matches".');
    return;
  }

  container.replaceChildren(makeElement("p", "muted", "Loading football picks..."));

  try {
    const [matchSnapshot, packageSnapshot, revealedSnapshot] =
      await Promise.all([
        getDocs(collection(db, "matches")),
        getDocs(collection(db, "vipPackages")),
        getDocs(collection(db, "revealedPicks"))
      ]);

    const matches = matchSnapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));

    const packages = new Map(
      packageSnapshot.docs.map(item => [
        item.id,
        item.data()
      ])
    );

    const revealed = new Map(
      revealedSnapshot.docs.map(item => {
        const data = item.data();
        return [data.matchId || item.id, data];
      })
    );

    matches.sort((a, b) =>
      `${a.date || ""} ${a.time || ""}`.localeCompare(
        `${b.date || ""} ${b.time || ""}`
      )
    );

    container.replaceChildren();

    if (!matches.length) {
      container.appendChild(
        makeElement("p", "muted", "No matches published yet.")
      );
      return;
    }

    const freeSection = makeElement("section", "free-picks-section");
    freeSection.appendChild(makeElement("h2", "", "🟢 Free Picks"));

    const vipSection = makeElement("section", "vip-picks-section");
    vipSection.appendChild(makeElement("h2", "", "🔒 VIP Picks"));

    const freeMatches = matches.filter(
      match => match.pickType !== "premium"
    );

    const vipMatches = matches.filter(
      match => match.pickType === "premium"
    );

    if (!freeMatches.length) {
      freeSection.appendChild(
        makeElement("p", "muted", "No free picks available yet.")
      );
    }

    for (const match of freeMatches) {
      const card = makeElement("article", "match-card");
      card.appendChild(makeElement(
        "h3",
        "",
        `${match.homeTeam || "Home"} vs ${match.awayTeam || "Away"}`
      ));

      card.appendChild(makeElement(
        "p",
        "muted",
        `${match.league || ""} • ${match.date || ""} ${match.time || ""}`
      ));

      card.appendChild(makeElement(
        "p",
        "",
        `Pick: ${match.pick || "Not published"}`
      ));

      card.appendChild(makeElement(
        "p",
        "muted",
        `Status: ${match.status || "upcoming"}`
      ));

      if (match.status === "finished") {
        card.appendChild(makeElement(
          "p",
          "",
          `Result: ${match.result || "pending"}${match.score ? ` • Score: ${match.score}` : ""}`
        ));
      }

      freeSection.appendChild(card);
    }

    if (!vipMatches.length) {
      vipSection.appendChild(
        makeElement("p", "muted", "No VIP matches available yet.")
      );
    }

    const vipByDate = new Map();

    for (const match of vipMatches) {
      const date = match.date || "Date not set";

      if (!vipByDate.has(date)) {
        vipByDate.set(date, []);
      }

      vipByDate.get(date).push(match);
    }

    for (const [date, dayMatches] of vipByDate) {
      const packageBox = makeElement("div", "vip-package");
      const packageInfo = packages.get(date);

      packageBox.appendChild(makeElement(
        "h3",
        "",
        `VIP Package — ${date}`
      ));

      if (packageInfo && Number.isFinite(Number(packageInfo.price))) {
        packageBox.appendChild(makeElement(
          "p",
          "vip-package-price",
          `Daily package price: KSh ${formatPrice(packageInfo.price)}`
        ));
      } else {
        packageBox.appendChild(makeElement(
          "p",
          "muted",
          "Daily package price has not been set yet."
        ));
      }

      packageBox.appendChild(makeElement(
        "p",
        "muted",
        `${dayMatches.length} VIP ${dayMatches.length === 1 ? "match" : "matches"} in this package`
      ));

      for (const match of dayMatches) {
        const card = makeElement("article", "match-card premium-box");

        card.appendChild(makeElement(
          "h4",
          "",
          `${match.homeTeam || "Home"} vs ${match.awayTeam || "Away"}`
        ));

        card.appendChild(makeElement(
          "p",
          "muted",
          `${match.league || ""} • ${match.time || ""}`
        ));

        const releasedPick = revealed.get(match.id);

        if (match.status === "finished" && releasedPick?.pick) {
          card.appendChild(makeElement(
            "p",
            "",
            `✅ Published VIP Pick: ${releasedPick.pick}`
          ));

          card.appendChild(makeElement(
            "p",
            "muted",
            `Result: ${match.result || "pending"}${match.score ? ` • Score: ${match.score}` : ""}`
          ));
        } else {
          card.appendChild(makeElement(
            "p",
            "",
            "🔒 VIP prediction locked"
          ));

          card.appendChild(makeElement(
            "p",
            "muted",
            "The prediction will be revealed when the match is finished and its pick has been published."
          ));
        }

        packageBox.appendChild(card);
      }

      vipSection.appendChild(packageBox);
    }

    container.append(freeSection, vipSection);

  } catch (error) {
    console.error("Unable to load football picks:", error);
    container.replaceChildren(
      makeElement(
        "p",
        "error",
        "Unable to load football picks. Please refresh the page and try again."
      )
    );
  }
}

loadMatches();
