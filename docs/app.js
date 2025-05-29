// --- Configuration ---
const PAGE_SIZE = 8;

// --- State ---
let allBookmarks = [];
let allTags = [];
let filteredTags = [];
let selectedTags = [];
let currentPage = 1;

// --- DOM Elements ---
const tagsListEl = document.getElementById('tagsList');
const bookmarksSectionEl = document.getElementById('bookmarksSection');
const paginationEl = document.getElementById('pagination');

// --- Fetch bookmarks.json ---
fetch('bookmarks.json')
  .then(res => res.json())
  .then(data => {
    allBookmarks = data.bookmarks.slice().reverse(); // last first
    allTags = Array.from(new Set(allBookmarks.flatMap(b => b.tags))).sort((a, b) => a.localeCompare(b, 'es'));
    filteredTags = allTags;
    renderTags();
    renderBookmarks();
    renderPagination();
  });

// --- Tag Filtering ---
window.filterTags = function (search) {
  filteredTags = allTags.filter(tag => tag.toLowerCase().includes(search.toLowerCase()));
  renderTags();
};

window.clearAllTags = function() {
  selectedTags = [];
  currentPage = 1;
  renderTags();
  renderBookmarks();
  renderPagination();
};

window.toggleTagsVisibility = function() {
  const tagsList = document.getElementById('tagsList');
  const toggleBtn = document.querySelector('.toggle-tags svg path');
  const isHidden = tagsList.classList.toggle('hidden');
  toggleBtn.setAttribute('d', isHidden ? 'M9 7l5 5-5 5z' : 'M7 10l5 5 5-5z');
};

function renderTags() {
  tagsListEl.innerHTML = '';
  filteredTags.forEach(tag => {
    const tagEl = document.createElement('span');
    tagEl.className = 'tag' + (selectedTags.includes(tag) ? ' selected' : '');
    tagEl.textContent = tag;
    tagEl.onclick = () => toggleTag(tag);
    tagsListEl.appendChild(tagEl);
  });
}

function toggleTag(tag) {
  if (selectedTags.includes(tag)) {
    selectedTags = selectedTags.filter(t => t !== tag);
  } else {
    selectedTags.push(tag);
  }
  currentPage = 1;
  renderTags();
  renderBookmarks();
  renderPagination();
}

// --- Bookmarks Filtering & Rendering ---
function getFilteredBookmarks() {
  if (selectedTags.length === 0) return allBookmarks;
  return allBookmarks.filter(b => selectedTags.every(tag => b.tags.includes(tag)));
}

function renderBookmarks() {
  const bookmarks = getFilteredBookmarks();
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageBookmarks = bookmarks.slice(start, end);
  bookmarksSectionEl.innerHTML = '';
  if (pageBookmarks.length === 0) {
    bookmarksSectionEl.innerHTML = '<div style="color:#888">No bookmarks found.</div>';
    return;
  }
  pageBookmarks.forEach(b => {
    const div = document.createElement('div');
    div.className = 'bookmark';
    div.innerHTML = `<div class="bookmark-title"><a href="${b.url}" target="_blank">${b.title}</a></div>` +
      `<div class="bookmark-tags">${b.tags.map(t => `<span>${t}</span>`).join(', ')}</div>`;
    bookmarksSectionEl.appendChild(div);
  });
}

// --- Pagination ---
function renderPagination() {
  const bookmarks = getFilteredBookmarks();
  const totalPages = Math.ceil(bookmarks.length / PAGE_SIZE);
  paginationEl.innerHTML = '';
  if (totalPages <= 1) return;

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '←';
  prevBtn.disabled = (currentPage === 1);
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderBookmarks();
      renderPagination();
    }
  };
  paginationEl.appendChild(prevBtn);

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = '→';
  nextBtn.disabled = (currentPage === totalPages);
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderBookmarks();
      renderPagination();
    }
  };
  paginationEl.appendChild(nextBtn);
} 
