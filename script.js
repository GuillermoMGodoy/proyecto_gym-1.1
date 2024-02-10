document.addEventListener('DOMContentLoaded', function () {
    const membersList = document.getElementById('members');
    const addMemberBtn = document.getElementById('add-member-btn');
    const newMemberNameInput = document.getElementById('new-member-name');
    const searchInput = document.getElementById('search-input');
    const memberCounter = document.getElementById('total-members');
    const loginForm = document.getElementById('login-form');

    let memberCount = localStorage.getItem('memberCount') ? parseInt(localStorage.getItem('memberCount')) : 0;
    let isLoggedIn = false;

    function updateMemberCounter() {
        memberCounter.textContent = memberCount;
    }

    function renderMembers() {
        membersList.innerHTML = '';

        if (!isLoggedIn) return;

        const searchTerm = searchInput.value.trim().toLowerCase();

        for (let i = 1; i <= memberCount; i++) {
            const memberName = localStorage.getItem(`member${i}`);
            const lastPaymentDate = localStorage.getItem(`lastPaymentDate_${i}`) || getCurrentDate();
            const li = document.createElement('li');
            li.className = 'member-item';
            const isPending = isMemberPending(lastPaymentDate);
            li.style.color = isPending ? 'red' : 'green';
            li.innerHTML = `
                <span>${memberName}</span>
                <div class="controls">
                    <input type="date" value="${lastPaymentDate}" class="payment-date" data-member-index="${i}">
                    <button class="edit-member-btn">Editar</button>
                    <button class="delete-member-btn">Eliminar</button>
                </div>
            `;
            const memberNameLower = memberName.toLowerCase();
            if (memberNameLower.includes(searchTerm)) {
                membersList.appendChild(li);
            }
        }
        attachEditMemberListeners();
        attachDeleteMemberListeners();
    }

    function addMember() {
        if (!isLoggedIn) return;

        const memberName = newMemberNameInput.value.trim();
        if (memberName === '') return;

        memberCount++;
        localStorage.setItem('memberCount', memberCount);
        localStorage.setItem(`member${memberCount}`, memberName);
        localStorage.setItem(`lastPaymentDate_${memberCount}`, getCurrentDate());

        updateMemberCounter();
        renderMembers();

        newMemberNameInput.value = '';
    }

    function deleteMember(memberIndex) {
        if (!isLoggedIn) return;

        if (memberIndex < 1 || memberIndex > memberCount) return;

        for (let i = memberIndex; i < memberCount; i++) {
            localStorage.setItem(`member${i}`, localStorage.getItem(`member${i + 1}`));
            localStorage.setItem(`lastPaymentDate_${i}`, localStorage.getItem(`lastPaymentDate_${i + 1}`));
        }

        localStorage.removeItem(`member${memberCount}`);
        localStorage.removeItem(`lastPaymentDate_${memberCount}`);

        memberCount--;
        localStorage.setItem('memberCount', memberCount);

        updateMemberCounter();
        renderMembers();
    }

    function editMember(memberIndex, newPaymentDate) {
        if (!isLoggedIn) return;

        const lastPaymentDate = localStorage.getItem(`lastPaymentDate_${memberIndex}`);
        const wasPending = isMemberPending(lastPaymentDate);

        localStorage.setItem(`lastPaymentDate_${memberIndex}`, newPaymentDate);
        renderMembers();

        const currentPaymentDate = localStorage.getItem(`lastPaymentDate_${memberIndex}`);
        const isPending = isMemberPending(currentPaymentDate);

        const memberItem = document.querySelector(`.member-item[data-member-index="${memberIndex}"]`);
        if (wasPending && !isPending) {
            memberItem.style.color = 'green';
        } else if (!wasPending && isPending) {
            memberItem.style.color = 'red';
        }
    }

    function getCurrentDate() {
        const date = new Date();
        const year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function isMemberPending(lastPaymentDate) {
        const currentDate = new Date();
        const lastPayment = new Date(lastPaymentDate);
        const diffInDays = Math.ceil((currentDate - lastPayment) / (1000 * 60 * 60 * 24));
        return diffInDays > 30;
    }

    function attachEditMemberListeners() {
        const editButtons = document.querySelectorAll('.edit-member-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', function () {
                const parent = this.closest('.member-item');
                const memberIndex = parseInt(parent.querySelector('.payment-date').getAttribute('data-member-index'));
                const newPaymentDate = parent.querySelector('.payment-date').value;
                editMember(memberIndex, newPaymentDate);
            });
        });
    }

    function attachDeleteMemberListeners() {
        const deleteButtons = document.querySelectorAll('.delete-member-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function () {
                const parent = this.closest('.member-item');
                const memberIndex = parseInt(parent.querySelector('.payment-date').getAttribute('data-member-index'));
                deleteMember(memberIndex);
            });
        });
    }

    function login(username, password) {
        // Aquí puedes implementar tu lógica de autenticación
        if (username === 'klostersgym' && password === 'misterolimpia') {
            isLoggedIn = true;
            loginForm.style.display = 'none'; // Oculta el formulario de inicio de sesión
            renderMembers(); // Renderiza la lista de miembros después del inicio de sesión
        } else {
            alert('Credenciales incorrectas');
        }
    }

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Evita que el formulario se envíe normalmente

        const username = this.elements['username'].value;
        const password = this.elements['password'].value;

        login(username, password);
    });

    addMemberBtn.addEventListener('click', addMember);
    searchInput.addEventListener('input', renderMembers);

    // Renderizar miembros existentes en la carga de la página si está autenticado
    if (isLoggedIn) {
        updateMemberCounter();
        renderMembers();
    }
});
