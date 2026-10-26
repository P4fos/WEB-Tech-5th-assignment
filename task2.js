const MAX_MIDDLE_CARDS = 3;

const COLUMNS = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress (Max 3)' },
    { id: 'done', title: 'Done' }
];

const tasks = [
    { id: 1, title: 'Create HTML layout', tag: 'frontend', priority: 3, isUrgent: true, steps: ['html', 'dom'], status: 'done' },
    { id: 2, title: 'Write CSS grid styles', tag: 'design', priority: 2, isUrgent: false, steps: ['css'], status: 'done' },
    { id: 3, title: 'Setup database tables', tag: 'backend', priority: 3, isUrgent: true, steps: ['sql', 'schema'], status: 'inprogress' },
    { id: 4, title: 'Build login validation', tag: 'frontend', priority: 3, isUrgent: true, steps: ['js', 'form'], status: 'inprogress' },
    { id: 5, title: 'Connect REST API', tag: 'backend', priority: 2, isUrgent: false, steps: ['api'], status: 'inprogress' },
    { id: 6, title: 'Design dark mode theme', tag: 'design', priority: 1, isUrgent: false, steps: ['ui', 'colors'], status: 'todo' },
    { id: 7, title: 'Add keyboard navigation', tag: 'frontend', priority: 2, isUrgent: false, steps: ['a11y'], status: 'todo' },
    { id: 8, title: 'Optimize server queries', tag: 'backend', priority: 1, isUrgent: false, steps: ['db'], status: 'todo' },
    { id: 9, title: 'Prepare icon assets', tag: 'design', priority: 1, isUrgent: false, steps: ['svg'], status: 'todo' },
    { id: 10, title: 'Fix mobile responsiveness', tag: 'frontend', priority: 3, isUrgent: true, steps: ['media'], status: 'todo' }
];

let nextId = 11;

const statsEl = document.getElementById('kanban-stats');
const boardEl = document.getElementById('kanban-board');
const msgBanner = document.getElementById('kanban-msg');
const tagFilter = document.getElementById('tag-filter');
const prioritySort = document.getElementById('priority-sort');
const addForm = document.getElementById('add-card-form');
const newTitle = document.getElementById('new-title');
const newTag = document.getElementById('new-tag');
const newPriority = document.getElementById('new-priority');

function render() {
    let doneCount = 0;
    for (let i = 0; i < tasks.length; i += 1) {
        if (tasks[i].status === 'done') {
            doneCount += 1;
        }
    }
    const percent = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

    statsEl.replaceChildren();
    const label = document.createElement('p');
    label.textContent = `Done: ${doneCount} / ${tasks.length} (${percent}%)`;
    const bar = document.createElement('progress');
    bar.max = 100;
    bar.value = percent;
    statsEl.appendChild(label);
    statsEl.appendChild(bar);

    const selectedTag = tagFilter.value;
    const sortDir = prioritySort.value;

    const visibleTasks = tasks
        .filter((t) => selectedTag === 'all' || t.tag === selectedTag)
        .sort((a, b) => (sortDir === 'desc' ? b.priority - a.priority : a.priority - b.priority));

    boardEl.replaceChildren();

    if (visibleTasks.length === 0) {
        const emptyBox = document.createElement('p');
        emptyBox.className = 'empty-state';
        emptyBox.textContent = 'No cards found for the selected tag.';
        boardEl.appendChild(emptyBox);
        return;
    }

    for (const col of COLUMNS) {
        const colDiv = document.createElement('div');
        colDiv.className = 'panel';

        const colTitle = document.createElement('h3');
        colTitle.textContent = col.title;
        colDiv.appendChild(colTitle);

        const colTasks = visibleTasks.filter((t) => t.status === col.id);

        for (const task of colTasks) {
            const card = document.createElement('div');
            card.className = 'kanban-card';

            const title = document.createElement('strong');
            title.textContent = task.title;

            const info = document.createElement('small');
            info.textContent = `Tag: ${task.tag} | Priority: ${task.priority} | Urgent: ${task.isUrgent} | Steps: ${task.steps.join(', ')}`;

            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';

            if (task.status !== 'todo') {
                const leftBtn = document.createElement('button');
                leftBtn.type = 'button';
                leftBtn.textContent = '← Left';
                leftBtn.dataset.id = String(task.id);
                leftBtn.dataset.dir = 'left';
                btnGroup.appendChild(leftBtn);
            }

            if (task.status !== 'done') {
                const rightBtn = document.createElement('button');
                rightBtn.type = 'button';
                rightBtn.textContent = 'Right →';
                rightBtn.dataset.id = String(task.id);
                rightBtn.dataset.dir = 'right';
                btnGroup.appendChild(rightBtn);
            }

            card.appendChild(title);
            card.appendChild(info);
            card.appendChild(btnGroup);
            colDiv.appendChild(card);
        }

        boardEl.appendChild(colDiv);
    }
}

boardEl.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-id]');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const dir = btn.dataset.dir;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const order = ['todo', 'inprogress', 'done'];
    const currentIdx = order.indexOf(task.status);
    const nextIdx = dir === 'right' ? currentIdx + 1 : currentIdx - 1;
    const nextStatus = order[nextIdx];

    if (nextStatus === 'inprogress') {
        const middleCount = tasks.filter((t) => t.status === 'inprogress').length;
        if (middleCount >= MAX_MIDDLE_CARDS) {
            msgBanner.textContent = 'Blocked: "In Progress" column already has the maximum of 3 cards!';
            msgBanner.className = 'banner is-error';
            return;
        }
    }

    msgBanner.className = 'banner hidden';
    task.status = nextStatus;
    render();
});

addForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const titleVal = newTitle.value.trim();
    if (!titleVal) return;

    tasks.push({
        id: nextId++,
        title: titleVal,
        tag: newTag.value,
        priority: Number(newPriority.value),
        isUrgent: Number(newPriority.value) === 3,
        steps: ['new'],
        status: 'todo'
    });

    newTitle.value = '';
    msgBanner.className = 'banner hidden';
    render();
});

tagFilter.addEventListener('change', render);
prioritySort.addEventListener('change', render);

render();