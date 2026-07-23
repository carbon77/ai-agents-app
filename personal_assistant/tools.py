from langchain_core.tools import tool


@tool
def create_calendar_event(
        title: str,
        start_time: str,
        end_time: str,
        attendees: list[str],
        location: str = "",
) -> str:
    """Create calendar event. Requires exact ISO datetime format"""
    message = f"Event created: {title} from {start_time} to {end_time} with {len(attendees)} attendees"
    print(message)
    return message

@tool
def send_email(
        to: list[str],
        subject: str,
        body: str,
        cc: list[str] = []
) -> str:
    """Send an email via email API. Requires properly formatted email"""
    return f"Email sent to {", ".join(to)} - Subject: {subject}"

@tool
def get_available_time_slots(
        attendees: list[str],
        date: str,
        duration_minutes: int,
) -> list[str]:
    """Check calendar availability for given attendees"""
    return ["09:00", "14:00", "16:00"]