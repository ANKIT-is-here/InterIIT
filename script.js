
document.addEventListener("DOMContentLoaded", function () {
    const treeView = document.getElementById('treeview');
    const itemDetails = document.getElementById('item-details');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    let godownsData = [];
    let itemsData = [];
    Promise.all([
        fetch('data/godowns.json').then(response => response.json()),
        fetch('data/items.json').then(response => response.json())
    ]).then(([godowns, items]) => {
        godownsData = godowns;
        itemsData = items;
        renderTreeView(godownsData, itemsData);
    });

    function renderTreeView(godowns, items) {
        const godownMap = {};
        godowns.forEach(godown => {
            godownMap[godown.id] = godown;
            godown.subLocations = [];
        });

        godowns.forEach(godown => {
            if (godown.parent_godown) {
                godownMap[godown.parent_godown].subLocations.push(godown);
            }
        });

        const rootGodowns = godowns.filter(g => !g.parent_godown);
        const treeHtml = createTreeHtml(rootGodowns, items);
        treeView.innerHTML = treeHtml;

        attachEventListeners();
    }

    function attachEventListeners() {
        document.querySelectorAll('.tree-node').forEach(el => {
            el.addEventListener('click', function (e) {
                e.stopPropagation();  
                el.classList.toggle('collapsed');
            });
        });

        document.querySelectorAll('.item').forEach(el => {
            el.addEventListener('click', function (e) {
                e.stopPropagation(); 
                const itemId = el.getAttribute('data-id');
                const item = itemsData.find(i => i.item_id === itemId);
                displayItemDetails(item);
            });
        });
    }

    function createTreeHtml(godowns, items) {
        let html = '<ul>';
        godowns.forEach(godown => {
            html += `
                <li class="tree-node collapsed">
                    <strong class="bold">${godown.name}</strong>
                    ${godown.subLocations.length > 0 ? createTreeHtml(godown.subLocations, items) : ''}
                    ${createItemHtml(items.filter(item => item.godown_id === godown.id))}
                </li>`;
        });
        html += '</ul>';
        return html;
    }

    function createItemHtml(godownItems) {
        if (godownItems.length === 0) return '';
        let html = '<ul class="item-list">';
        godownItems.forEach(item => {
            html += `<li class="item" data-id="${item.item_id}"><em class="bold-italic">${item.name}</em></li>`;
        });
        html += '</ul>';
        return html;
    }

    function displayItemDetails(item) {
        if (!item) return;

        itemDetails.innerHTML = `
            <h3>${item.name}</h3>
            <p><strong>Category:</strong> ${item.category}</p>
            <p><strong>Price:</strong> $${item.price}</p>
            <p><strong>Quantity:</strong> ${item.quantity}</p>
            <p><strong>Status:</strong> ${item.status}</p>
            <p><strong>Brand:</strong> ${item.brand}</p>
            <img src="${item.image_url}" alt="${item.name}">
        `;
    }

    searchInput.addEventListener('input', function () {
        const query = searchInput.value.toLowerCase();
        const filteredGodowns = godownsData.filter(godown => 
            godown.name.toLowerCase().includes(query) || 
            itemsData.some(item => item.name.toLowerCase().includes(query) && item.godown_id === godown.id)
        );
        renderTreeView(filteredGodowns, itemsData);
    });

    categoryFilter.addEventListener('change', function () {
        const selectedCategory = categoryFilter.value;
        const filteredItems = selectedCategory === 'all' ? itemsData :
            itemsData.filter(item => item.category === selectedCategory);
        renderTreeView(godownsData, filteredItems);
    });
});
