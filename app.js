(() => {
  'use strict';

  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSKlLQMEpcnLtAEpyjG85WjHNWPeKP2er_baGRjtjxsAUjFo7z7gu5aahKpmh0FN9O0nYtIh1dpQTq/pub?output=csv';
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbyzNdCjP_4xrbCazD8H_2jsz63OlFGKdn1FnZhhkXcaNs-hHF8YJWVV1fxz7ZNLKbM1/exec';
  const REQUEST_EMAIL = 'sfiimscsubcommittee25@gmail.com';
  const WHATSAPP_URL = 'https://whatsapp.com/channel/0029VaesYjiHgZWZT1NwWo1z';
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const state = {
    resources: [], loading: true, loadError: false,
    query: '', semester: 'All', type: 'All', subject: 'All',
    savedSemester: safeGet('als_preferred_semester', ''),
    theme: safeGet('als_theme', 'dark'), activeResourceId: null,
    activeSuggestion: -1, toastTimer: null
  };
  state.semester = state.savedSemester || 'All';
  $('#my-semester').value = state.savedSemester;

  function safeGet(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (_) { return fallback; }
  }

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value === null ? fallback : value;
    } catch (_) { return fallback; }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { showToast('Your browser could not save this preference.'); }
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function normalizeType(value) {
    const type = String(value || '').trim().toLowerCase();
    if (type.includes('pyq') || type.includes('question')) return 'PYQ';
    if (type.includes('note')) return 'Notes';
    if (type.includes('text') || type.includes('book')) return 'Textbook';
    return String(value || 'Resource').trim() || 'Resource';
  }

  function normaliseUrl(value) {
    try {
      const url = new URL(String(value || '').trim());
      if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    } catch (_) { /* invalid spreadsheet URL */ }
    return '';
  }

  function getValue(row, ...names) {
    const keys = Object.keys(row || {});
    for (const name of names) {
      const match = keys.find(key => key.trim().toLowerCase() === name.toLowerCase());
      if (match && String(row[match] ?? '').trim()) return String(row[match]).trim();
    }
    return '';
  }

  function yearFrom(title) {
    const match = String(title || '').match(/\b(?:19|20)\d{2}\b/);
    return match ? match[0] : '';
  }

  function mapRow(row, index) {
    const title = getValue(row, 'Title', 'TITL');
    const link = normaliseUrl(getValue(row, 'Link'));
    const semesterRaw = getValue(row, 'Semester');
    const semesterMatch = semesterRaw.match(/\d{1,2}/);
    const semester = semesterMatch ? String(Math.min(10, Math.max(1, Number(semesterMatch[0])))) : '';
    return {
      id: String(index), title, link, semester,
      type: normalizeType(getValue(row, 'Type')),
      subject: getValue(row, 'Subject') || 'General',
      year: yearFrom(title)
    };
  }

  function setTheme(theme, save = true) {
    state.theme = theme === 'light' ? 'light' : 'dark';
    document.body.classList.toggle('light-theme', state.theme === 'light');
    $('#theme-label').textContent = state.theme === 'dark' ? 'Light mode' : 'Dark mode';
    $('.theme-icon').textContent = state.theme === 'dark' ? '☼' : '☾';
    if (save) {
      try { localStorage.setItem('als_theme', state.theme); } catch (_) { /* theme still applies for this session */ }
    }
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3800);
  }

  function getRatings() { return readJSON('als_resource_feedback', {}); }
  function saveRatings(value) { writeJSON('als_resource_feedback', value); }
  function getLogs() { return readJSON('als_resource_opens', []); }
  function getContributors() { return readJSON('als_local_contributors', []); }

  function filteredResources() {
    const query = state.query.trim().toLowerCase();
    return state.resources.filter(resource => {
      const semesterMatch = state.semester === 'All' || resource.semester === state.semester;
      const typeMatch = state.type === 'All' || resource.type === state.type;
      const subjectMatch = state.subject === 'All' || resource.subject === state.subject;
      const searchable = `${resource.title} ${resource.subject} ${resource.type} ${resource.semester} ${resource.year}`.toLowerCase();
      return semesterMatch && typeMatch && subjectMatch && (!query || searchable.includes(query));
    });
  }

  function renderSemesterFilters() {
    const choices = ['All', ...Array.from({ length: 10 }, (_, i) => String(i + 1))];
    $('#semester-filters').innerHTML = choices.map(value => {
      const label = value === 'All' ? 'All semesters' : `Sem ${value}`;
      return `<button class="filter-chip${state.semester === value ? ' is-active' : ''}" type="button" data-action="filter-semester" data-value="${value}" aria-pressed="${state.semester === value}">${label}</button>`;
    }).join('');
  }

  function renderTypeFilters() {
    const choices = ['All', 'Textbook', 'PYQ', 'Notes'];
    $('#type-filters').innerHTML = choices.map(value => {
      const label = value === 'All' ? 'All types' : value === 'PYQ' ? 'PYQs' : value === 'Textbook' ? 'Textbooks' : 'Notes';
      return `<button class="filter-chip${state.type === value ? ' is-active' : ''}" type="button" data-action="filter-type" data-value="${escapeHTML(value)}" aria-pressed="${state.type === value}">${label}</button>`;
    }).join('');
  }

  function renderSubjectFilters() {
    const counts = new Map();
    state.resources.forEach(resource => counts.set(resource.subject, (counts.get(resource.subject) || 0) + 1));
    const subjects = Array.from(counts.entries())
      .filter(([name]) => !['all subject', 'all subjects'].includes(name.trim().toLowerCase()))
      .sort((a, b) => a[0].localeCompare(b[0]));
    if (!subjects.length) {
      $('#subject-filters').innerHTML = '<span class="filter-hint">Subject filters will appear when resources load.</span>';
      return;
    }
    const choices = [['All', 0], ...subjects];
    $('#subject-filters').innerHTML = choices.map(([value, count]) => {
      const active = state.subject === value;
      const label = value === 'All' ? 'All subjects' : `${escapeHTML(value)} <span aria-hidden="true">${count}</span>`;
      return `<button class="filter-chip${active ? ' is-active' : ''}" type="button" data-action="filter-subject" data-value="${escapeHTML(value)}" aria-pressed="${active}">${label}</button>`;
    }).join('');
  }

  function cardHTML(resource) {
    const ratings = getRatings();
    const feedback = ratings[resource.id] || { helpful: 0, mine: false, comments: [] };
    const typeMark = resource.type === 'PYQ' ? '▤' : resource.type === 'Notes' ? '✎' : '▧';
    const commentCount = Array.isArray(feedback.comments) ? feedback.comments.length : 0;
    return `<article class="resource-card">
      <div class="resource-meta"><span class="semester-tag">Semester ${escapeHTML(resource.semester || '—')}</span><span class="type-tag">${escapeHTML(resource.type)}</span></div>
      <div class="card-mark" aria-hidden="true">${typeMark}</div>
      <h3>${escapeHTML(resource.title)}</h3>
      <p class="resource-subject">${escapeHTML(resource.subject)}</p>
      <div class="resource-card-bottom">
        <a class="resource-open" href="${escapeHTML(resource.link)}" target="_blank" rel="noopener noreferrer" data-resource-open="${escapeHTML(resource.id)}">Open resource <span aria-hidden="true">↗</span></a>
        <div class="card-feedback" aria-label="Local feedback">
          <button class="feedback-button${feedback.mine ? ' is-active' : ''}" type="button" data-action="helpful" data-id="${escapeHTML(resource.id)}" aria-label="Mark ${escapeHTML(resource.title)} useful"><span aria-hidden="true">♥</span>${Number(feedback.helpful) || 0}</button>
          <button class="feedback-button" type="button" data-action="open-comments" data-id="${escapeHTML(resource.id)}" aria-label="Read or add notes on ${escapeHTML(resource.title)}"><span aria-hidden="true">☷</span>${commentCount}</button>
        </div>
      </div>
    </article>`;
  }

  function updateResults() {
    const skeletons = $('#loading-skeletons');
    const grid = $('#resource-grid');
    const empty = $('#empty-state');
    const error = $('#error-state');
    const counter = $('#resource-counter');
    const summary = $('#results-summary');

    skeletons.hidden = !state.loading;
    grid.hidden = state.loading || state.loadError;
    empty.hidden = true;
    error.hidden = !state.loadError;
    counter.hidden = state.loading || state.loadError;

    if (state.loading) {
      summary.textContent = 'Mapping your study shelf…';
      $('#active-filter-label').textContent = 'Loading library';
      return;
    }
    if (state.loadError) {
      summary.textContent = 'The resource list is temporarily unavailable.';
      $('#active-filter-label').textContent = 'Connection needed';
      return;
    }

    const resources = filteredResources();
    $('#resource-count').textContent = resources.length.toLocaleString();
    grid.innerHTML = resources.map(cardHTML).join('');
    if (!resources.length) {
      grid.hidden = true;
      empty.hidden = false;
      const hasAnyResources = state.resources.length > 0;
      $('#empty-title').textContent = hasAnyResources ? 'No resources match those filters.' : 'The library is ready for its first resource.';
      $('#empty-copy').textContent = hasAnyResources ? 'Try another search or clear a filter to see more of the collection.' : 'Check back soon, or help grow the shelf by contributing a resource.';
    } else {
      grid.hidden = false;
    }
    summary.textContent = `${resources.length.toLocaleString()} ${resources.length === 1 ? 'resource' : 'resources'} shown${state.query ? ` for “${state.query}”` : ''}.`;
    const labels = [];
    if (state.semester !== 'All') labels.push(`Sem ${state.semester}`);
    if (state.type !== 'All') labels.push(state.type === 'PYQ' ? 'PYQs' : state.type);
    if (state.subject !== 'All') labels.push(state.subject);
    $('#active-filter-label').textContent = labels.length ? labels.join(' · ') : 'All resources';
  }

  function openCountMap(logs = getLogs()) {
    const cutoff = Date.now() - WEEK_MS;
    const counts = new Map();
    logs.filter(item => Number(item.at) >= cutoff).forEach(item => counts.set(String(item.id), (counts.get(String(item.id)) || 0) + 1));
    return counts;
  }

  function renderRankedList(container, items, counts, emptyText) {
    if (!items.length) {
      container.innerHTML = `<li class="discovery-empty">${escapeHTML(emptyText)}</li>`;
      return;
    }
    container.innerHTML = items.map((resource, index) => {
      const count = counts.get(String(resource.id)) || 0;
      const countLabel = `${count} ${count === 1 ? 'open' : 'opens'} this week`;
      return `<li class="discovery-item"><span class="discovery-rank">0${index + 1}</span><button class="discovery-link" type="button" data-action="scroll-to-resource" data-id="${escapeHTML(resource.id)}" title="${escapeHTML(resource.title)}">${escapeHTML(resource.title)}</button><span class="discovery-count">${countLabel}</span></li>`;
    }).join('');
  }

  function renderDiscovery() {
    const logs = getLogs();
    const counts = openCountMap(logs);
    const pyqs = state.resources.filter(resource => resource.type === 'PYQ' && (counts.get(String(resource.id)) || 0) > 0)
      .sort((a, b) => (counts.get(String(b.id)) || 0) - (counts.get(String(a.id)) || 0) || a.title.localeCompare(b.title)).slice(0, 3);
    renderRankedList($('#weekly-pyqs'), pyqs, counts, 'Open a PYQ from the library and your most-used papers will be collected here for the next 7 days. This history stays on your device.');

    const semester = state.savedSemester || (state.semester !== 'All' ? state.semester : '');
    $('#semester-trend-title').textContent = semester ? `Trending notes for Sem ${semester}` : 'Trending notes for your semester';
    const notes = semester ? state.resources.filter(resource => resource.semester === semester && resource.type === 'Notes' && (counts.get(String(resource.id)) || 0) > 0)
      .sort((a, b) => (counts.get(String(b.id)) || 0) - (counts.get(String(a.id)) || 0) || a.title.localeCompare(b.title)).slice(0, 3) : [];
    renderRankedList($('#semester-notes'), notes, counts, semester ? 'Open a note from this semester and your most-used notes will appear here.' : 'Choose your semester above to see relevant notes. Activity is counted only on this device.');
  }

  function badgeFor(contributor, contributors) {
    const badges = [];
    if (contributor.count >= 1) badges.push('First share');
    if (contributor.count >= 3) badges.push('Note Ninja');
    const topMonth = contributors.reduce((best, item) => !best || item.monthCount > best.monthCount ? item : best, null);
    if (topMonth && topMonth.name === contributor.name && contributor.monthCount > 0) badges.push('Comrade of the Month');
    return badges;
  }

  function renderContributors() {
    const contributors = getContributors().filter(item => item && item.name && Number(item.count) > 0)
      .sort((a, b) => (Number(b.monthCount) || 0) - (Number(a.monthCount) || 0) || (Number(b.count) || 0) - (Number(a.count) || 0));
    const board = $('#contributor-board');
    if (!contributors.length) {
      board.innerHTML = '<div class="contributor-empty">The board is ready for its first contribution. Add a name when you share a resource to create a private contribution record on this device.</div>';
      return;
    }
    board.innerHTML = contributors.slice(0, 3).map((contributor, index) => {
      const badges = badgeFor(contributor, contributors);
      return `<article class="contributor-card"><span class="contributor-rank">${index + 1}</span><div class="contributor-info"><h3 class="contributor-name">${escapeHTML(contributor.name)}</h3><p class="contributor-count">${Number(contributor.count)} submission ${Number(contributor.count) === 1 ? 'attempt' : 'attempts'} · this month ${Number(contributor.monthCount) || 0}</p><div class="contributor-badges">${badges.map(badge => `<span class="contributor-badge">${escapeHTML(badge)}</span>`).join('')}</div></div></article>`;
    }).join('');
  }

  function renderAll() {
    renderSemesterFilters();
    renderTypeFilters();
    renderSubjectFilters();
    updateResults();
    renderDiscovery();
    renderContributors();
  }

  function recordOpen(id) {
    const logs = getLogs().filter(item => Number(item.at) > Date.now() - 30 * 24 * 60 * 60 * 1000);
    logs.push({ id: String(id), at: Date.now() });
    writeJSON('als_resource_opens', logs.slice(-250));
    renderDiscovery();
  }

  function loadLibrary() {
    state.loading = true;
    state.loadError = false;
    updateResults();
    if (!window.Papa) {
      state.loading = false;
      state.loadError = true;
      updateResults();
      return;
    }
    window.Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      skipEmptyLines: 'greedy',
      complete: result => {
        const resources = (result.data || []).map(mapRow).filter(item => item.title && item.link);
        state.resources = resources;
        state.loading = false;
        state.loadError = false;
        renderAll();
      },
      error: () => {
        state.resources = [];
        state.loading = false;
        state.loadError = true;
        renderAll();
      }
    });
  }

  function suggestionsFor(query) {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const suggestions = new Map();
    state.resources.forEach(resource => {
      const pairs = [[resource.title, 'Title'], [resource.subject, 'Subject']];
      if (resource.type === 'PYQ' && resource.year) pairs.push([resource.year, 'PYQ year']);
      pairs.forEach(([value, kind]) => {
        if (value && value.toLowerCase().includes(needle)) {
          const key = `${kind}:${value}`;
          if (!suggestions.has(key)) suggestions.set(key, { value, kind });
        }
      });
    });
    return Array.from(suggestions.values()).sort((a, b) => {
      const exact = Number(a.value.toLowerCase().startsWith(needle));
      const other = Number(b.value.toLowerCase().startsWith(needle));
      return other - exact || a.value.localeCompare(b.value);
    }).slice(0, 8);
  }

  function renderSuggestions() {
    const box = $('#search-suggestions');
    const options = suggestionsFor(state.query);
    state.activeSuggestion = -1;
    if (!state.query.trim() || !options.length) {
      box.hidden = true;
      box.innerHTML = '';
      $('#resource-search').setAttribute('aria-expanded', 'false');
      return;
    }
    box.innerHTML = options.map((item, index) => `<button class="suggestion-option" type="button" role="option" aria-selected="false" data-action="select-suggestion" data-index="${index}" data-value="${escapeHTML(item.value)}" data-kind="${escapeHTML(item.kind)}"><span class="suggestion-value">${escapeHTML(item.value)}</span><span class="suggestion-kind">${escapeHTML(item.kind)}</span></button>`).join('');
    box.hidden = false;
    $('#resource-search').setAttribute('aria-expanded', 'true');
  }

  function closeDialog(dialog) { if (dialog.open) dialog.close(); }

  function openRequest(resource) {
    const form = $('#request-form');
    form.reset();
    if (state.savedSemester) $('#request-semester').value = state.savedSemester;
    if (resource) {
      $('#request-title').value = resource.title;
      $('#request-semester').value = resource.semester || '';
      $('#request-type').value = resource.type;
      $('#request-subject').value = resource.subject;
      $('#request-notes').value = `Please check this resource: ${resource.link}`;
    }
    $('#request-dialog').showModal();
    $('#request-title').focus();
  }

  function openContribute() {
    $('#contribute-form').reset();
    if (state.savedSemester) $('#contribution-semester').value = state.savedSemester;
    $('#contribute-dialog').showModal();
    $('#contribution-title').focus();
  }

  function openComments(id) {
    const resource = state.resources.find(item => item.id === String(id));
    if (!resource) return;
    state.activeResourceId = resource.id;
    $('#comments-title').textContent = resource.title;
    renderComments();
    $('#comments-dialog').showModal();
  }

  function renderComments() {
    const feedback = getRatings()[state.activeResourceId] || { comments: [] };
    const comments = Array.isArray(feedback.comments) ? feedback.comments : [];
    $('#comment-list').innerHTML = comments.length ? comments.map(comment => {
      const date = new Date(Number(comment.at) || Date.now());
      return `<article class="comment-item"><p>${escapeHTML(comment.text)}</p><time>${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · saved on this device</time></article>`;
    }).join('') : '<div class="comment-empty">No notes yet. Add a quick heads-up or let classmates know why you found this useful. Notes stay in this browser.</div>';
  }

  function updateHelpful(id) {
    const ratings = getRatings();
    const item = ratings[String(id)] || { helpful: 0, mine: false, comments: [] };
    if (item.mine) item.helpful = Math.max(0, (Number(item.helpful) || 0) - 1);
    else item.helpful = (Number(item.helpful) || 0) + 1;
    item.mine = !item.mine;
    ratings[String(id)] = item;
    saveRatings(ratings);
    updateResults();
  }

  function trackContribution(name) {
    const contributorName = String(name || '').trim() || 'Anonymous contributor';
    const contributors = getContributors();
    const month = new Date().toISOString().slice(0, 7);
    let contributor = contributors.find(item => item.name.toLowerCase() === contributorName.toLowerCase());
    if (!contributor) {
      contributor = { name: contributorName, count: 0, monthCount: 0, month };
      contributors.push(contributor);
    }
    if (contributor.month !== month) { contributor.month = month; contributor.monthCount = 0; }
    contributor.count = (Number(contributor.count) || 0) + 1;
    contributor.monthCount = (Number(contributor.monthCount) || 0) + 1;
    writeJSON('als_local_contributors', contributors);
    renderContributors();
  }

  function handleAction(button) {
    const action = button.dataset.action;
    const value = button.dataset.value;
    const id = button.dataset.id;
    switch (action) {
      case 'toggle-theme': setTheme(state.theme === 'dark' ? 'light' : 'dark'); break;
      case 'clear-search':
        state.query = '';
        $('#resource-search').value = '';
        $('#clear-search').hidden = true;
        renderSuggestions(); renderAll();
        $('#resource-search').focus();
        break;
      case 'filter-semester': state.semester = value; renderAll(); break;
      case 'filter-type': state.type = value; renderAll(); break;
      case 'filter-subject': state.subject = value; renderAll(); break;
      case 'reset-filters':
        state.semester = state.savedSemester || 'All'; state.type = 'All'; state.subject = 'All'; state.query = '';
        $('#resource-search').value = '';
        $('#clear-search').hidden = true;
        renderSuggestions(); renderAll();
        break;
      case 'retry-load': loadLibrary(); break;
      case 'open-request': openRequest(); break;
      case 'open-contribute': openContribute(); break;
      case 'close-modal': closeDialog(button.closest('dialog')); break;
      case 'helpful': updateHelpful(id); break;
      case 'open-comments': openComments(id); break;
      case 'select-suggestion': {
        const kind = button.dataset.kind;
        state.query = kind === 'Subject' ? '' : value;
        $('#resource-search').value = kind === 'Subject' ? '' : value;
        $('#clear-search').hidden = !state.query;
        if (kind === 'Subject') { state.subject = value; state.semester = state.savedSemester || 'All'; }
        renderSuggestions(); renderAll();
        $('#resource-search').focus();
        break;
      }
      case 'scroll-to-resource': {
        const resource = state.resources.find(item => item.id === String(id));
        if (!resource) break;
        state.semester = 'All'; state.type = 'All'; state.subject = 'All'; state.query = '';
        $('#resource-search').value = '';
        $('#clear-search').hidden = true;
        renderAll();
        requestAnimationFrame(() => {
          const card = $$('.resource-card').find(element => element.querySelector(`[data-resource-open="${CSS.escape(String(id))}"]`));
          if (card) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); card.classList.add('highlight-card'); setTimeout(() => card.classList.remove('highlight-card'), 1700); }
        });
        break;
      }
      case 'report-active-resource': {
        const resource = state.resources.find(item => item.id === state.activeResourceId);
        closeDialog($('#comments-dialog'));
        openRequest(resource);
        break;
      }
    }
  }

  document.addEventListener('click', event => {
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) { handleAction(actionButton); return; }
    const link = event.target.closest('[data-resource-open]');
    if (link) recordOpen(link.dataset.resourceOpen);
    if (!event.target.closest('.search-bar')) {
      $('#search-suggestions').hidden = true;
      $('#resource-search').setAttribute('aria-expanded', 'false');
    }
  });

  $('#resource-search').addEventListener('input', event => {
    state.query = event.target.value;
    $('#clear-search').hidden = !state.query;
    renderSuggestions();
    updateResults();
  });

  $('#resource-search').addEventListener('keydown', event => {
    const box = $('#search-suggestions');
    const options = $$('.suggestion-option', box);
    if (event.key === 'ArrowDown' && options.length) {
      event.preventDefault(); state.activeSuggestion = (state.activeSuggestion + 1) % options.length;
      options.forEach((option, index) => option.setAttribute('aria-selected', String(index === state.activeSuggestion)));
    } else if (event.key === 'ArrowUp' && options.length) {
      event.preventDefault(); state.activeSuggestion = (state.activeSuggestion - 1 + options.length) % options.length;
      options.forEach((option, index) => option.setAttribute('aria-selected', String(index === state.activeSuggestion)));
    } else if (event.key === 'Enter' && state.activeSuggestion >= 0 && options[state.activeSuggestion]) {
      event.preventDefault(); handleAction(options[state.activeSuggestion]);
    } else if (event.key === 'Escape') {
      box.hidden = true; event.target.setAttribute('aria-expanded', 'false');
    }
  });

  $('#my-semester').addEventListener('change', event => {
    state.savedSemester = event.target.value;
    state.semester = state.savedSemester || 'All';
    try {
      if (state.savedSemester) localStorage.setItem('als_preferred_semester', state.savedSemester);
      else localStorage.removeItem('als_preferred_semester');
    } catch (_) { /* preference remains active for this session */ }
    renderAll();
    if (state.savedSemester) showToast(`Your library is now focused on Semester ${state.savedSemester}.`);
  });

  $('#request-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = String(form.get('subject') || '').trim();
    const semester = String(form.get('semester') || '').trim();
    const type = String(form.get('type') || 'Resource').trim();
    const title = String(form.get('title') || '').trim();
    const notes = String(form.get('notes') || '').trim();
    const emailSubject = `Digital library resource request: ${title}`;
    const body = [`Requested resource: ${title}`, `Type: ${type}`, `Semester: ${semester || 'Any semester'}`, `Subject: ${subject || 'Not specified'}`, '', notes ? `Details: ${notes}` : 'Details: —'].join('\n');
    const mailto = `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    closeDialog($('#request-dialog'));
    showToast('Your email app should open with the request addressed to the subcommittee.');
  });

  $('#contribute-form').addEventListener('submit', async event => {
    event.preventDefault();
    const contributionForm = event.currentTarget;
    const form = new FormData(contributionForm);
    const link = normaliseUrl(form.get('link'));
    if (!link || !new URL(link).hostname.toLowerCase().endsWith('drive.google.com')) {
      $('#drive-hint').textContent = 'Please use a valid Google Drive link.';
      $('#drive-hint').style.color = 'var(--red)';
      $('#contribution-link').focus();
      return;
    }
    $('#drive-hint').textContent = 'Set sharing to “Anyone with the link can view”.';
    $('#drive-hint').style.color = '';
    const payload = {
      title: String(form.get('title') || '').trim(),
      semester: Number(form.get('semester')) || 1,
      type: String(form.get('type') || 'Notes'),
      subject: String(form.get('subject') || '').trim(),
      link
    };
    const contributorName = String(form.get('contributor') || '').trim();
    const submit = $('#contribute-submit');
    submit.disabled = true;
    submit.textContent = 'Sending…';
    try {
      await fetch(GAS_URL, { method: 'POST', mode: 'no-cors', cache: 'no-cache', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      trackContribution(contributorName);
      closeDialog($('#contribute-dialog'));
      contributionForm.reset();
      showToast('Submission attempted. The existing form cannot confirm delivery or review status; contact the subcommittee if you need a receipt.');
    } catch (_) {
      showToast('Could not submit right now. Please email the subcommittee directly.');
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Send for review <span aria-hidden="true">↗</span>';
    }
  });

  $('#comment-form').addEventListener('submit', event => {
    event.preventDefault();
    const text = String(new FormData(event.currentTarget).get('comment-text') || $('#comment-text').value).trim();
    if (!text || state.activeResourceId === null) return;
    const ratings = getRatings();
    const item = ratings[state.activeResourceId] || { helpful: 0, mine: false, comments: [] };
    item.comments = Array.isArray(item.comments) ? item.comments : [];
    item.comments.push({ text, at: Date.now() });
    ratings[state.activeResourceId] = item;
    saveRatings(ratings);
    event.currentTarget.reset();
    renderComments();
    updateResults();
    showToast('Your note is saved in this browser. It is not shared with other students.');
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const open = $('dialog[open]');
      if (open) closeDialog(open);
    }
  });
  $$('.modal').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog(dialog);
  }));

  setTheme(state.theme, false);
  renderSemesterFilters();
  renderTypeFilters();
  updateResults();
  loadLibrary();
})();
