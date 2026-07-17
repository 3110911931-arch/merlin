// ---- Mobile Nav Toggle ----
document.getElementById("navToggle").addEventListener("click", function() {
  document.getElementById("navLinks").classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(function(link) {
  link.addEventListener("click", function() {
    document.getElementById("navLinks").classList.remove("open");
  });
});

// ---- Scroll Reveal ----
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".reveal").forEach(function(el) {
  observer.observe(el);
});

// ---- Active Nav Highlight ----
var sections = document.querySelectorAll("section[id]");
var navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", function() {
  var current = "";
  sections.forEach(function(s) {
    var top = s.offsetTop - 100;
    if (window.scrollY >= top) current = s.getAttribute("id");
  });
  navLinks.forEach(function(a) {
    a.classList.toggle("active", a.getAttribute("href") === "#" + current);
  });
  document.getElementById("nav").classList.toggle("scrolled", window.scrollY > 50);
});

// ---- Toast ----
function copyText(text, msg) {
  navigator.clipboard.writeText(text).then(function() {
    var toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(function() { toast.classList.remove("show"); }, 2000);
  });
}

// ---- Project Toggle ----
function toggleProject(card) {
  card.classList.toggle("expanded");
  var hint = card.querySelector(".project-expand-hint span:first-child");
  hint.textContent = card.classList.contains("expanded") ? "收起" : "查看详情";
}

// ================================================
// Thoughts Section
// ================================================
var THOUGHTS_PER_PAGE = 5;
var currentFilter = "all";
var currentPage = 1;

function renderThoughts() {
  // Filter
  var filtered = thoughtsData;
  if (currentFilter !== "all") {
    filtered = thoughtsData.filter(function(t) { return t.type === currentFilter; });
  }

  // Paginate
  var totalPages = Math.ceil(filtered.length / THOUGHTS_PER_PAGE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  var start = (currentPage - 1) * THOUGHTS_PER_PAGE;
  var pageItems = filtered.slice(start, start + THOUGHTS_PER_PAGE);

  // Render list
  var listEl = document.getElementById("thoughtList");
  if (pageItems.length === 0) {
    listEl.innerHTML = "<div class=\"thought-empty\">暂无内容</div>";
  } else {
    var html = "";
    pageItems.forEach(function(item) {
      var icon = item.type === "video" ? "▶" : "📄";
      var iconClass = item.type === "video" ? "video" : "article";
      var badgeClass = item.type === "video" ? "video" : "article";
      var typeLabel = item.type === "video" ? "视频" : "文章";
      var actionHtml = item.type === "video"
        ? "<div class=\"thought-item-action\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"5 3 19 12 5 21 5 3\"/></svg> 播放</div>"
        : "<div class=\"thought-item-action\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/><polyline points=\"15 3 21 3 21 9\"/><line x1=\"10\" y1=\"14\" x2=\"21\" y2=\"3\"/></svg> 阅读</div>";

      html += "<div class=\"thought-item\" onclick=\"openThought(" + item.id + ")\">"
        + "<div class=\"thought-item-icon " + iconClass + "\">" + icon + "</div>"
        + "<div class=\"thought-item-body\">"
        + "<div class=\"thought-item-meta\">"
        + "<span class=\"thought-type-badge " + badgeClass + "\">" + typeLabel + "</span>"
        + "<span class=\"thought-item-date\">" + item.date + "</span>"
        + "</div>"
        + "<div class=\"thought-item-title\">" + item.title + "</div>"
        + "<div class=\"thought-item-summary\" id=\"ts-" + item.id + "\">" + item.summary + "</div>"
        + "<span class=\"thought-summary-toggle\" onclick=\"event.stopPropagation();toggleSummary(" + item.id + ")\">展开</span>"
        + "</div>"
        + actionHtml
        + "</div>";
    });
    listEl.innerHTML = html;
  }

  // Render pagination
  renderPagination(totalPages, filtered.length);
}

function toggleSummary(id) {
  var el = document.getElementById("ts-" + id);
  var btn = el.nextElementSibling;
  el.classList.toggle("expanded");
  btn.textContent = el.classList.contains("expanded") ? "收起" : "展开";
}

function renderPagination(totalPages, totalItems) {
  var pagEl = document.getElementById("thoughtPagination");
  if (totalPages <= 1) {
    pagEl.innerHTML = "";
    return;
  }

  var html = "";
  html += "<button class=\"page-btn\" onclick=\"goToPage(" + (currentPage - 1) + ")\"" + (currentPage <= 1 ? " disabled" : "") + ">‹ 上一页</button>";

  for (var i = 1; i <= totalPages; i++) {
    html += "<button class=\"page-btn" + (i === currentPage ? " active" : "") + "\" onclick=\"goToPage(" + i + ")\">" + i + "</button>";
  }

  html += "<button class=\"page-btn\" onclick=\"goToPage(" + (currentPage + 1) + ")\"" + (currentPage >= totalPages ? " disabled" : "") + ">下一页 ›</button>";

  pagEl.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  renderThoughts();
  document.getElementById("thoughts").scrollIntoView({ behavior: "smooth", block: "start" });
}

function filterThoughts(filter) {
  currentFilter = filter;
  currentPage = 1;

  document.querySelectorAll(".thought-filter").forEach(function(btn) {
    btn.classList.toggle("active", btn.getAttribute("data-filter") === filter);
  });

  renderThoughts();
}

function openThought(id) {
  var item = thoughtsData.find(function(t) { return t.id === id; });
  if (!item) return;

  if (item.type === "video") {
    var modal = document.getElementById("thoughtModal");
    var container = document.getElementById("thoughtModalIframe");
    container.innerHTML = "<iframe src=\"" + item.embedUrl + "\" allowfullscreen></iframe>";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  } else {
    window.open(item.link, "_blank");
  }
}

function closeThoughtModal() {
  var modal = document.getElementById("thoughtModal");
  modal.classList.remove("open");
  document.getElementById("thoughtModalIframe").innerHTML = "";
  document.body.style.overflow = "";
}

document.addEventListener("click", function(e) {
  var modal = document.getElementById("thoughtModal");
  if (e.target === modal) closeThoughtModal();
});

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") closeThoughtModal();
});

// Init thoughts if data exists
if (typeof thoughtsData !== "undefined") {
  renderThoughts();
}
