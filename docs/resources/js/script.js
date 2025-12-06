const events = [];

const categoryConfig = {
    work: { label: 'Work', color: '#d1e7dd', textColor: '#0f5132' },
    personal: { label: 'Personal', color: '#f8d7da', textColor: '#842029' },
    study: { label: 'Study', color: '#cff4fc', textColor: '#055160' },
    other: { label: 'Other', color: '#e2e3e5', textColor: '#41464b' }
};

let form;
let modalitySelect;
let categorySelect;
let locationGroup;
let remoteUrlGroup;
let locationInput;
let remoteUrlInput;
let timeInput;
let eventNameInput;
let weekdaySelect;
let attendeesInput;
let editingEventIndex = null;
let editingEventElement = null;

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const meetingUrlPattern = /^https?:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(?:[^\s]*)?$/i;
function updateLocationOptions() {
    const isRemote = modalitySelect.value === 'remote';

    locationGroup.classList.toggle('d-none', isRemote);
    remoteUrlGroup.classList.toggle('d-none', !isRemote);

    locationInput.required = !isRemote;
    remoteUrlInput.required = isRemote;

    if (isRemote) {
        locationInput.setCustomValidity('');
    } else {
        remoteUrlInput.setCustomValidity('');
    }
}

function validateTime() {
    const value = timeInput.value;
    if (value && !timePattern.test(value)) {
        timeInput.setCustomValidity('Please enter time in HH:MM 24-hour format.');
    } else {
        timeInput.setCustomValidity('');
    }
}

function validateMeetingUrl() {
    const value = remoteUrlInput.value.trim();
    if (!remoteUrlInput.required && value === '') {
        remoteUrlInput.setCustomValidity('');
        return;
    }

    if (value && !meetingUrlPattern.test(value)) {
        remoteUrlInput.setCustomValidity('Remote URL must start with http:// or https://');
    } else {
        remoteUrlInput.setCustomValidity('');
    }
}

function saveEvent(submitEvent) {
    submitEvent.preventDefault();

    validateTime();
    validateMeetingUrl();

    if (!form.checkValidity()) {
        submitEvent.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const isRemote = modalitySelect.value === 'remote';
    const eventDetails = {
        name: eventNameInput.value.trim(),
        weekday: weekdaySelect.value,
        time: timeInput.value,
        modality: modalitySelect.value,
        category: categorySelect.value,
        location: isRemote ? '' : locationInput.value.trim(),
        remoteUrl: isRemote ? remoteUrlInput.value.trim() : '',
        attendees: attendeesInput.value.trim()
    };

    const isEditing = editingEventIndex !== null;
    if (isEditing) {
        events[editingEventIndex] = eventDetails;
        const updatedCard = createEventCard(eventDetails, editingEventIndex);
        const newDayColumn = document.getElementById(eventDetails.weekday);
        if (editingEventElement?.parentNode && editingEventElement.parentNode.id === eventDetails.weekday) {
            editingEventElement.replaceWith(updatedCard);
        } else if (newDayColumn) {
            editingEventElement?.remove();
            newDayColumn.appendChild(updatedCard);
        }
    } else {
        events.push(eventDetails);
        addEventToCalendarUI(eventDetails, events.length - 1);
    }

    const modalElement = document.getElementById('eventModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.hide();

    form.reset();
    form.classList.remove('was-validated');

    updateLocationOptions();
    validateTime();
    validateMeetingUrl();
    editingEventIndex = null;
    editingEventElement = null;
}

function addEventToCalendarUI(eventInfo, eventIndex) {
    const dayColumn = document.getElementById(eventInfo.weekday);
    if (!dayColumn) {
        return;
    }

    const eventCard = createEventCard(eventInfo, eventIndex);
    dayColumn.appendChild(eventCard);
}

function createEventCard(eventDetails, eventIndex) {
    const category = categoryConfig[eventDetails.category] || categoryConfig.other;

    const eventElement = document.createElement('div');
    eventElement.className = 'event row border rounded m-1 py-1';
    eventElement.style.backgroundColor = category.color;
    eventElement.style.color = category.textColor;
    eventElement.style.borderColor = category.textColor;
    eventElement.dataset.eventIndex = eventIndex;

    const detailDiv = document.createElement('div');
    detailDiv.className = 'col';

    const titleLine = document.createElement('div');
    titleLine.className = 'fw-semibold';
    titleLine.textContent = eventDetails.name;

    const metaLine = document.createElement('div');
    metaLine.className = 'small';
    metaLine.textContent = eventDetails.time + ' • ' + category.label;

    const locationLine = document.createElement('div');
    locationLine.className = 'small';
    locationLine.textContent = eventDetails.modality === 'remote'
        ? 'Remote URL: ' + eventDetails.remoteUrl
        : 'Location: ' + eventDetails.location;

    const attendeesLine = document.createElement('div');
    attendeesLine.className = 'small';
    attendeesLine.textContent = 'Attendees: ' + eventDetails.attendees;

    detailDiv.append(titleLine, metaLine, locationLine, attendeesLine);
    eventElement.appendChild(detailDiv);
    eventElement.addEventListener('click', () => openEventForEdit(eventIndex, eventElement));

    return eventElement;
}

function openEventForEdit(eventIndex, cardElement) {
    const eventDetails = events[eventIndex];
    if (!eventDetails) {
        return;
    }

    editingEventIndex = eventIndex;
    editingEventElement = cardElement;
    form.classList.remove('was-validated');

    eventNameInput.value = eventDetails.name;
    weekdaySelect.value = eventDetails.weekday;
    timeInput.value = eventDetails.time;
    modalitySelect.value = eventDetails.modality;
    categorySelect.value = eventDetails.category;
    attendeesInput.value = eventDetails.attendees;

    updateLocationOptions();
    locationInput.value = eventDetails.location;
    remoteUrlInput.value = eventDetails.remoteUrl;

    validateTime();
    validateMeetingUrl();

    const modalElement = document.getElementById('eventModal');
    bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

document.addEventListener('DOMContentLoaded', () => {
    form = document.getElementById('eventForm');
    if (!form) {
        return;
    }

    modalitySelect = document.getElementById('event_modality');
    categorySelect = document.getElementById('event_category');
    locationGroup = document.getElementById('location_group');
    remoteUrlGroup = document.getElementById('remote_url_group');
    locationInput = document.getElementById('event_location');
    remoteUrlInput = document.getElementById('event_remote_url');
    timeInput = document.getElementById('event_time');
    eventNameInput = document.getElementById('event_name');
    weekdaySelect = document.getElementById('event_weekday');
    attendeesInput = document.getElementById('event_attendees');

    modalitySelect.addEventListener('change', () => {
        updateLocationOptions();
        validateMeetingUrl();
    });
    timeInput.addEventListener('input', validateTime);
    remoteUrlInput.addEventListener('input', validateMeetingUrl);
    form.addEventListener('submit', saveEvent);
    const modalElement = document.getElementById('eventModal');
    modalElement.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.classList.remove('was-validated');
        editingEventIndex = null;
        editingEventElement = null;
        updateLocationOptions();
        validateTime();
        validateMeetingUrl();
    });

    updateLocationOptions();
    validateTime();
    validateMeetingUrl();
});
