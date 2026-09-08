(function (window, document) {
  "use strict";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function getGroups(sections) {
    return sections.reduce(function (groups, section) {
      if (groups.indexOf(section.group) === -1) groups.push(section.group);
      return groups;
    }, []);
  }

  function renderNavigation(root, sections) {
    root.innerHTML = getGroups(sections).map(function (group) {
      var links = sections.filter(function (section) {
        return section.group === group;
      }).map(function (section) {
        return '<li data-nav-item="' + section.id + '"><a href="#' + section.id + '" data-nav="' + section.id + '">' + escapeHtml(section.title) + "</a></li>";
      }).join("");
      return '<div class="nav-group"><h3>' + escapeHtml(group) + "</h3><ul>" + links + "</ul></div>";
    }).join("");
  }

  function renderTopicFooter(previous, next) {
    var previousLink = previous
      ? '<a class="footer-nav prev" href="#' + previous.id + '"><span class="fn-label">← Zurück</span>' + escapeHtml(previous.title) + "</a>"
      : '<span class="footer-nav spacer"></span>';
    var nextLink = next
      ? '<a class="footer-nav next" href="#' + next.id + '"><span class="fn-label">Weiter →</span>' + escapeHtml(next.title) + "</a>"
      : '<span class="footer-nav spacer"></span>';
    return '<div class="topic-footer">' + previousLink + nextLink + "</div>";
  }

  function renderTopics(root, sections) {
    var totalTopics = sections.filter(function (section) {
      return section.id !== "ueberblick";
    }).length;
    var topicIndex = 0;

    root.innerHTML = sections.map(function (section, index) {
      var isOverview = section.id === "ueberblick";
      if (!isOverview) topicIndex++;

      var topicHtml = '<section class="topic' + (isOverview ? " cheat" : "") + '" id="' + section.id + '" data-title="' + escapeHtml(section.title.toLowerCase()) + '">';
      if (!isOverview) topicHtml += '<div class="crumb">' + escapeHtml(section.group) + " · Teil " + topicIndex + " von " + totalTopics + "</div>";
      topicHtml += '<div class="topic-head">';
      topicHtml += isOverview
        ? '<span class="sec-num start" aria-hidden="true">★</span>'
        : '<span class="sec-num" aria-hidden="true">' + topicIndex + "</span>";
      topicHtml += "<h2>" + escapeHtml(section.title) + "</h2></div>" + section.html;
      return topicHtml + renderTopicFooter(sections[index - 1], sections[index + 1]) + "</section>";
    }).join("");
  }

  function setupCopyButtons() {
    document.addEventListener("click", function (event) {
      var copyButton = event.target.closest(".copy-btn");
      if (!copyButton || !navigator.clipboard) return;

      var codeElement = document.getElementById(copyButton.getAttribute("data-copy-target"));
      if (!codeElement) return;

      navigator.clipboard.writeText(codeElement.textContent).then(function () {
        copyButton.textContent = "Kopiert!";
        copyButton.classList.add("copied");
        window.setTimeout(function () {
          copyButton.textContent = "Kopieren";
          copyButton.classList.remove("copied");
        }, 1500);
      });
    });
  }

  function setupTemplateDownloads() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest(".download-btn");
      if (!link) return;

      var url = link.getAttribute("href");
      var filename = link.getAttribute("download") || "vorlage.cpp";
      if (!url || !window.fetch) return;

      event.preventDefault();

      fetch(url)
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.blob();
        })
        .then(function (blob) {
          var blobUrl = URL.createObjectURL(blob);
          var tempLink = document.createElement("a");
          tempLink.href = blobUrl;
          tempLink.download = filename;
          document.body.appendChild(tempLink);
          tempLink.click();
          document.body.removeChild(tempLink);
          window.setTimeout(function () {
            URL.revokeObjectURL(blobUrl);
          }, 1000);
        })
        .catch(function () {
          // Fallback, falls fetch/Blob nicht verfügbar sind: Datei im Tab öffnen,
          // dort kann sie manuell gespeichert werden (Strg/Cmd+S).
          window.open(url, "_blank");
        });
    });
  }

  function setupFocusMode() {
    var focusButton = document.getElementById("focusToggle");
    focusButton.addEventListener("click", function () {
      var active = document.body.classList.toggle("focus-mode");
      focusButton.textContent = active ? "Übersicht" : "Fokus";
      focusButton.setAttribute("aria-pressed", String(active));
    });
  }

  function setupNavigation(sections) {
    var sidebar = document.getElementById("sidebar");
    var sectionIds = sections.reduce(function (ids, section) {
      ids[section.id] = true;
      return ids;
    }, {});
    var navLinks = {};
    var topicSections = {};
    var progressText = document.getElementById("progressText");
    var progressFill = document.getElementById("progressFill");

    document.querySelectorAll("a[data-nav]").forEach(function (link) {
      navLinks[link.getAttribute("data-nav")] = link;
    });
    document.querySelectorAll("section.topic").forEach(function (section) {
      topicSections[section.id] = section;
    });

    function showSection(id) {
      var target = sectionIds[id] ? id : sections[0].id;
      Object.keys(topicSections).forEach(function (sectionId) {
        topicSections[sectionId].classList.toggle("active", sectionId === target);
      });
      Object.keys(navLinks).forEach(function (sectionId) {
        navLinks[sectionId].classList.toggle("active", sectionId === target);
        navLinks[sectionId].setAttribute("aria-current", sectionId === target ? "page" : "false");
      });

      var activeIndex = sections.map(function (section) { return section.id; }).indexOf(target) + 1;
      progressText.textContent = activeIndex + " / " + sections.length;
      progressFill.style.width = (activeIndex / sections.length * 100) + "%";
      window.scrollTo(0, 0);
      sidebar.classList.remove("open");
    }

    document.getElementById("menuToggle").addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });
    window.addEventListener("hashchange", function () {
      showSection(window.location.hash.replace("#", ""));
    });
    document.getElementById("search").addEventListener("input", function (event) {
      var query = event.target.value.trim().toLowerCase();
      document.querySelectorAll("li[data-nav-item]").forEach(function (item) {
        var section = topicSections[item.getAttribute("data-nav-item")];
        var matches = !query || (section && section.textContent.toLowerCase().indexOf(query) !== -1);
        item.classList.toggle("hidden", !matches);
      });
    });

    showSection(window.location.hash ? window.location.hash.replace("#", "") : sections[0].id);
  }

  window.CppLernmodus = {
    init: function (sections) {
      if (!Array.isArray(sections) || sections.length === 0) return;
      renderNavigation(document.getElementById("navRoot"), sections);
      renderTopics(document.getElementById("contentRoot"), sections);
      setupCopyButtons();
      setupTemplateDownloads();
      setupFocusMode();
      setupNavigation(sections);
    }
  };
})(window, document);
