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

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const meetingUrlPattern = /^https?:\/\/\S+$/i;

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

    events.push(eventDetails);
    console.log('Events:', JSON.stringify(events, null, 2));

    addEventToCalendarUI(eventDetails);

    const modalElement = document.getElementById('eventModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.hide();

    form.reset();
    form.classList.remove('was-validated');

    updateLocationOptions();
    validateTime();
    validateMeetingUrl();
}

function addEventToCalendarUI(eventInfo) {
    const dayColumn = document.getElementById(eventInfo.weekday);
    if (!dayColumn) {
        return;
    }

    const eventCard = createEventCard(eventInfo);
    dayColumn.appendChild(eventCard);
}

function createEventCard(eventDetails) {
    const category = categoryConfig[eventDetails.category] || categoryConfig.other;

    const eventElement = document.createElement('div');
    eventElement.className = 'event row border rounded m-1 py-1';
    eventElement.style.backgroundColor = category.color;
    eventElement.style.color = category.textColor;
    eventElement.style.borderColor = category.textColor;

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

    return eventElement;
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

    updateLocationOptions();
    validateTime();
    validateMeetingUrl();
});
