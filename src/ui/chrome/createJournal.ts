import journal from '../../content/journal.json';
export interface JournalPost {
  id: string;
  title: string;
  url: string;
  date: string;
  excerpt: string;
  image: string;
}
export function createJournal(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'trapnest-journal';
  section.id = 'trapnest-journal';
  section.setAttribute('aria-label', 'The Trapnest journal');
  const heading = document.createElement('div');
  heading.className = 'trapnest-journal__heading';
  const title = document.createElement('h2');
  title.textContent = 'Field notes from Trapnest';
  const filter = document.createElement('select');
  filter.className = 'trapnest-journal__filter';
  filter.setAttribute('aria-label', 'Filter journal by month');
  const months = [...new Set(journal.posts.map(post => post.date.slice(0, 7)))];
  for (const month of ['', ...months]) {
    const option = document.createElement('option');
    option.value = month;
    option.textContent = month ? new Date(`${month}-15T12:00:00Z`).toLocaleDateString('en', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Taipei'
    }) : 'Since July 2026';
    filter.append(option);
  }
  heading.append(title, filter);
  const grid = document.createElement('div');
  grid.className = 'trapnest-journal__grid';
  grid.setAttribute('aria-live', 'polite');
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'trapnest-journal__more';
  let shown = 9;
  function render(): void {
    const posts: JournalPost[] = journal.posts.filter(post => post.date.startsWith(filter.value));
    grid.replaceChildren();
    for (const post of posts.slice(0, shown)) {
      const card = document.createElement('a');
      card.className = 'trapnest-journal__card';
      card.href = post.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      if (post.image) {
        const image = document.createElement('img');
        image.src = post.image;
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.width = 480;
        image.height = 300;
        card.append(image);
      }
      const date = document.createElement('time');
      date.dateTime = post.date;
      date.textContent = new Date(post.date).toLocaleDateString('en', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Taipei'
      }).toUpperCase();
      const name = document.createElement('strong');
      name.textContent = post.title;
      card.append(date, name);
      grid.append(card);
    }
    more.hidden = shown >= posts.length;
    more.textContent = `EXPLORE MORE · ${Math.max(0, posts.length - shown)} FIELD NOTES`;
  }
  filter.addEventListener('change', () => {
    shown = 9;
    render();
  });
  more.addEventListener('click', () => {
    shown += 9;
    render();
  });
  section.append(heading, grid, more);
  render();
  return section;
}
