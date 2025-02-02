const casters = nodecg.Replicant('casters');

const btnCreateCaster = document.getElementById('add-caster-btn');

casters.on('change', (newValue, oldValue) => {
    for (const id in newValue) {
        const object = newValue[id];

        if (oldValue) {
            if (!casterObjectsMatch(object, oldValue[id])) {
                updateOrCreateCreateCasterElem(id, object);
            }
        } else {
            updateOrCreateCreateCasterElem(id, object);
        }
    }

    // Handle deletions
    if (oldValue) {
        for (const id in oldValue) {
            if (!newValue[id]) {
                deleteCasterElem(id);
            }
        }
    }

    if (Object.keys(newValue).length >= 3) {
        btnCreateCaster.disabled = true;
        setUncommittedButtonDisabled(true);
    } else {
        btnCreateCaster.disabled = false;
        setUncommittedButtonDisabled(false);
    }
});

btnCreateCaster.addEventListener('click', (e) => {
    createCasterElem(generateId());
    if (getCasterContainerCount() >= 3) e.target.disabled = true;
});

document.getElementById('copy-casters-btn').addEventListener('click', () => {
    var casterText = '';

    Object.keys(casters.value).forEach((item, index, arr) => {
        const element = casters.value[item];
        casterText += `${element.name} (${element.pronouns}, ${element.twitter})`;

        if (arr[index + 2]) casterText += ', ';
        else if (arr[index + 1]) casterText += ' & ';
    });

    navigator.clipboard.writeText(casterText).then(null, () => {
        console.error('Error copying to clipboard.');
    });
});

function casterObjectsMatch(val1, val2) {
    if (!val1 || !val2) return false;

    return !(
        val1.name !== val2.name ||
        val1.twitter !== val2.twitter ||
        val1.pronouns !== val2.pronouns
    );
}

function setUncommittedButtonDisabled(disabled) {
    document.querySelectorAll('.uncommitted').forEach((elem) => {
        elem.disabled = disabled;
    });
}

function generateId() {
    return '' + Math.random().toString(36).substr(2, 9);
}

function deleteCasterElem(id) {
    const container = document.getElementById(`caster-container_${id}`);
    container.parentNode.removeChild(container);
}

function updateOrCreateCreateCasterElem(
    id,
    data = { name: '', twitter: '', pronouns: '' }
) {
    const container = document.getElementById(`caster-container_${id}`);
    if (container) {
        updateCasterElem(id, data);
    } else {
        createCasterElem(id, data, false);
    }
}

function updateCasterElem(
    id,
    data = { name: '', twitter: '', pronouns: '' },
    resetColor = true
) {
    document.getElementById(`caster-name-input_${id}`).value = data.name;
    document.getElementById(`caster-twitter-input_${id}`).value = data.twitter;
    document.getElementById(`caster-pronoun-input_${id}`).value = data.pronouns;
    if (resetColor) {
        document.getElementById(`update-caster_${id}`).style.backgroundColor =
            'var(--blue)';
    }
}

function getCasterContainerCount() {
    return document.querySelectorAll('.caster-container').length;
}

function createCasterElem(
    id,
    data = { name: '', twitter: '', pronouns: '' },
    newElem = true
) {
    if (newElem && getCasterContainerCount() >= 3) return;

    let container = document.createElement('div');
    container.classList.add('space');
    container.classList.add('caster-container');
    container.id = `caster-container_${id}`;

    container.innerHTML = `
	<div class="select-container">
		<label for="caster-name-input_${id}">Name</label>
		<input type="text" id="caster-name-input_${id}">
	</div>
	<div class="layout horizontal select-container">
		<div class="select-container caster-twitter-input-container">
			<label for="caster-twitter-input_${id}">Twitter</label>
			<input type="text" id="caster-twitter-input_${id}">
		</div>
		<div class="select-container">
			<label for="caster-pronoun-input_${id}">Pronouns</label>
			<input type="text" id="caster-pronoun-input_${id}">
		</div>
	</div>
	<div class="layout horizontal">
		<button
			class="max-width${newElem ? ' uncommitted' : ''}"
			id="update-caster_${id}"
			style="background-color: ${newElem ? 'var(--red)' : 'var(--blue)'}">
			update
		</button>
		<button class="red max-width" id="remove-caster_${id}">remove</button>
	</div>`;
    document.getElementById('casters').appendChild(container);

    // add data
    updateCasterElem(id, data, !newElem);

    // remind to update
    addChangeReminder(
        [
            `caster-name-input_${id}`,
            `caster-twitter-input_${id}`,
            `caster-pronoun-input_${id}`,
        ].map((elem) => document.getElementById(elem)),
        document.getElementById(`update-caster_${id}`)
    );

    // button click event
    document
        .getElementById(`update-caster_${id}`)
        .addEventListener('click', (e) => {
            const id = e.target.id.split('_')[1];
            try {
                casters.value[id] = {
                    name: document.getElementById(`caster-name-input_${id}`)
                        .value,
                    twitter: document.getElementById(
                        `caster-twitter-input_${id}`
                    ).value,
                    pronouns: document.getElementById(
                        `caster-pronoun-input_${id}`
                    ).value,
                };
            } catch (error) {
                console.error(error);
                return;
            }
            e.target.classList.remove('uncommitted');
        });
    document
        .getElementById(`remove-caster_${id}`)
        .addEventListener('click', (e) => {
            const id = e.target.id.split('_')[1];

            if (casters.value[id]) {
                delete casters.value[id];
            } else {
                deleteCasterElem(id);
            }
        });
}
