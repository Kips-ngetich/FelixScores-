import {
  db,
  collection,
  getDocs
} from "./firebase.js";

export async function loadMatches() {
  const container = document.getElementById("matches");

  if (!container) return;

  container.innerHTML = "<p>Loading matches...</p>";

  try {
    const snapshot = await getDocs(collection(db, "matches"));

    const matches = snapshot.docs.map(document => ({
      id: document.id,
      ...document.data()
    }));

    matches.sort((a, b) => {
      return `${a.date || ""} ${a.time || ""}`
        .localeCompare(`${b.date || ""} ${b.time || ""}`);
    });

    if (matches.length === 0) {
      container.innerHTML = `
        <div class="match-card">
          <h3>No matches published yet</h3>
          <p>Check back soon for the latest football matches and picks.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = matches.map(match => {
      const home = escapeHTML(match.homeTeam || "Home team");
      const away = escapeHTML(match.awayTeam || "Away team");
      const league = escapeHTML(match.league || "Football");
      const date = escapeHTML(match.date || "");
      const time = escapeHTML(match.time || "");
      const status = escapeHTML(match.status || "upcoming");
      const result = escapeHTML(match.result || "pending");
      const score = escapeHTML(match.score || "");

      const isPremium = match.pickType === "premium";

      const pickSection = isPremium
        ? `
          <div class="premium-box">
            <strong>🔒 PREMIUM PICK</strong>
            <p>Premium analysis is available separately.</p>
            <p><strong>Price: KSh ${formatPrice(match.price)}</strong></p>
            <a
              class="whatsapp-button"
              href="https://wa.me/254741140400?text=${encodeURIComponent(
                `Hello FELIXSCORES, I am interested in the premium pick for ${match.homeTeam || "Home team"} vs ${match.awayTeam || "Away team"}.`
              )}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask About This Pick on WhatsApp
            </a>
          </div>
        `
        : `
          <div class="free-box">
            <strong>🟢 FREE PICK</strong>
            <p>${escapeHTML(match.pick || "Pick not published yet")}</p>
          </div>
        `;

      return `
        <article class="match-card">
          <p class="league-name">${league}</p>

          <h3>${home} vs ${away}</h3>

          <p class="match-date">${date} ${time}</p>

          <p>Status: ${status}</p>

          ${pickSection}

          <div class="result-box">
            <p><strong>Pick result:</strong> ${result}</p>
            ${score ? `<p><strong>Final score:</strong> ${score}</p>` : ""}
          </div>
        </article>
      `;
    }).join("");

    } catch (error) {
    console.error("Error loading matches:", error);

    container.innerHTML = `
      <div class="match-card">
        <h3>Unable to load matches</h3>
        <p>${escapeHTML(error.code || error.message || "Unknown error")}</p>
      </div>
    `;
  }
}

function formatPrice(price) {
  const amount = Number(price);

  if (!Number.isFinite(amount) || amount < 0) {
    return "Contact us";
  }

  return amount.toLocaleString("en-KE");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}
