export interface ICSSettings {
    format: {
        timeFormat: string
        dataViewSyntax: boolean,
        notificationLevel: 'none' | 'light' | 'verbose';
    },
    calendars: Record < string, Calendar > ;
}

export interface Calendar {
    icsUrl: string;
    icsName: string;
    calendarType: 'remote' | 'vdir'; // Add this line
    format: {
        checkbox: boolean;
        includeEventEndTime: boolean;
        icsName: boolean;
        summary: boolean;
        location: boolean;
        description: boolean;
        showAttendees: boolean;
        showOngoing: boolean;
    }
}

export const DEFAULT_CALENDAR_FORMAT = {
    checkbox: true,
    includeEventEndTime: true,
    icsName: true,
    summary: true,
    location: true,
    description: false,
    calendarType: 'remote', // Set the default type to 'remote'
    showAttendees: false,
    showOngoing: false
};

export const DEFAULT_SETTINGS: ICSSettings = {
    format: {
        timeFormat: "HH:mm",
        dataViewSyntax: false,
        notificationLevel: 'none'
    },
    calendars: {
    }
};
