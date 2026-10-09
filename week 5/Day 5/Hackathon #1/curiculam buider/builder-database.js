const savedPlansApi = '/api/curriculum-builder/plans';
const savedPlansEscape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

async function loadSavedPlans() {
  const plansList = document.getElementById('saved-plans-list');
  const status = document.getElementById('saved-plans-status');
  if (!plansList || !status) return;

  status.textContent = 'Loading saved lesson plans...';
  try {
    const response = await fetch(savedPlansApi);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to load saved lesson plans.');
    }

    if (data.plans.length === 0) {
      status.textContent = 'No lesson plans saved yet.';
      plansList.innerHTML = '';
      return;
    }

    status.textContent = `${data.plans.length} saved lesson plan${data.plans.length === 1 ? '' : 's'}`;
    plansList.innerHTML = data.plans.map((plan) => `
      <article class="saved-plan">
        <div class="saved-plan-heading">
          <strong>${savedPlansEscape(plan.subject)} — ${savedPlansEscape(plan.strand)}</strong>
          <button class="saved-plan-delete" type="button" data-delete-plan="${plan.id}">Delete</button>
        </div>
        <p>${savedPlansEscape(plan.grade)} · ${savedPlansEscape(plan.duration)} · ${savedPlansEscape(plan.created_at)}</p>
        <details>
          <summary>View lesson plan</summary>
          <pre>${savedPlansEscape(plan.plan.content)}</pre>
        </details>
      </article>
    `).join('');
  } catch (error) {
    status.textContent = error.message || 'Unable to load saved lesson plans.';
  }
}

function mountSavedPlans() {
  const builder = document.getElementById('lesson-builder');
  if (!builder || document.getElementById('saved-plans')) return;

  const section = document.createElement('section');
  section.id = 'saved-plans';
  section.className = 'saved-plans';
  section.innerHTML = `
    <h4>Saved lesson plans</h4>
    <p id="saved-plans-status" class="saved-plans-status" aria-live="polite"></p>
    <div id="saved-plans-list"></div>
  `;
  builder.appendChild(section);
  loadSavedPlans();
}

async function saveGeneratedPlan(plan, button, status) {
  button.disabled = true;
  status.textContent = 'Saving lesson plan...';
  try {
    const response = await fetch(savedPlansApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to save this lesson plan.');
    }
    status.textContent = 'Lesson plan saved.';
    await loadSavedPlans();
  } catch (error) {
    status.textContent = error.message || 'Unable to save this lesson plan.';
  } finally {
    button.disabled = false;
  }
}

document.addEventListener('click', (event) => {
  const generateButton = event.target.closest('#lb-go');
  if (generateButton) {
    const output = document.getElementById('lb-out');
    const subject = document.querySelector('.subject-head h1')?.textContent.trim();
    const strandSelect = document.getElementById('lb-strand');
    const gradeSelect = document.getElementById('lb-grade');
    const durationSelect = document.getElementById('lb-time');
    if (!output || !subject || !strandSelect || !gradeSelect || !durationSelect) return;

    const saveArea = document.createElement('div');
    saveArea.className = 'save-plan-actions';
    const saveButton = document.createElement('button');
    saveButton.className = 'btn btn-primary';
    saveButton.type = 'button';
    saveButton.textContent = 'Save lesson plan';
    const status = document.createElement('span');
    status.className = 'saved-plans-status';
    saveButton.addEventListener('click', () => saveGeneratedPlan(
      {
        subject,
        strand: strandSelect.selectedOptions[0].textContent,
        grade: gradeSelect.value,
        duration: durationSelect.value,
        plan: { content: output.innerText },
      },
      saveButton,
      status,
    ));
    saveArea.append(saveButton, status);
    output.appendChild(saveArea);
    return;
  }

  const deleteButton = event.target.closest('[data-delete-plan]');
  if (!deleteButton) return;
  deleteSavedPlan(deleteButton);
});

async function deleteSavedPlan(button) {
  button.disabled = true;
  try {
    const response = await fetch(`${savedPlansApi}/${button.dataset.deletePlan}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to delete this lesson plan.');
    }
    await loadSavedPlans();
  } catch (error) {
    const status = document.getElementById('saved-plans-status');
    if (status) status.textContent = error.message || 'Unable to delete this lesson plan.';
    button.disabled = false;
  }
}

const savedPlansObserver = new MutationObserver(mountSavedPlans);
savedPlansObserver.observe(document.getElementById('subject'), { childList: true });
mountSavedPlans();
