import { useReducer, useMemo } from 'react';


// `useData` is a general purpose data-store hook
// The createAPI function returns an object with the functions that will be added to the data object returned from `useData` These are API functions that modify or process data in some way.
// After finishing whatever processing, these functions should eventually call `dispatch` with a message array that tells the reducer how to change the state
// `messageHandlers` contains a number of member functions that will respond to dispatched messages to the reducer
// The first element in a message array is the name of a function in this object,
// the rest of the elements of the array are passed as arguments to the member function
// these functions only return the state that they have modified, and it is merged afterwards with the old state
export function useData(initialData, createAPI, messageHandlers) {
    const [data, dispatch] = useReducer(
        function(oldState, msg) {
            const handler = messageHandlers[msg[0]];
            if(!handler) throw msg;
            return {
                ...oldState,
                ...(handler.apply(null, msg.slice(1)))
            };
        },
        initialData
    );

    const apiFuncs = useMemo(() => createAPI(dispatch), [dispatch, createAPI]);

    return {...data, ...apiFuncs};
}

function makeMockProfile(name) {
    return {
        id: 'user:'+name,
        name,
        avatarSrc: '/images/avatar.png',
    };
}

/// The main data-store hook for the user profile and other app global data. should only happen once in <App/>
export function useAppData() {
    function createMockUser() {
        return {
            ...makeMockProfile('John Douglas'),
            groups: [
                { id: 'group1', iconSrc: '#', name: '4096th YSA Ward' },
                { id: 'group2', iconSrc: '#', name: 'Douglas Family' },
                { id: 'group3', iconSrc: '#', name: 'Goose Watching Club' },
                { id: 'group4', iconSrc: '#', name: "Kevin's Pizza" },
            ]
        };
    }

    return useData(
        { user: null },
        dispatch => ({
            async login(username, password) {
                dispatch(['login']);
            },
            async logout() {
                dispatch(['logout']);
            }
        }),
        {
            login: () => ({ user: createMockUser() }),
            logout: () => ({ user: null }),
        }
    );
}

const mockEvents = [
    {
        id: 'e1', title: 'Weekly Goose Watch', date: new Date('2022-3-10T10:00:00'),
        groupId: 'group3', author: makeMockProfile('Greg Goobanik'),
        imgSrc: '/images/goose1.jpg',
        desc: 'Come see some lovely geese with us at Everest Park'
    },
    {
        id: 'e2', title: 'Family Reunion', date: new Date('2022-3-13T13:00:00'),
        groupId: 'group2', author: makeMockProfile('Bob Douglas'),
        desc: 'Calling all Douglases! Meet up at Aunt Judy\'s house'
    },
    {
        id: 'e3', title: 'Evening Meeting', date: new Date('2022-3-13T21:30:00'),
        groupId: 'group3', author: makeMockProfile('Greg Goobanik'),
        desc: 'Come discuss the important business of our club. Elections are coming up!'
    },
    {
        id: 'e4', title: 'Game Night', date: new Date('2022-3-23T20:00:00'),
        groupId: 'group1', author: makeMockProfile('Quinn Stephens'),
        imgSrc: '/images/game.jpg',
        desc: "If you like to play games, you won't want to miss this month's game night!"
    },
    {
        id: 'e5', title: 'All You Can Eat Wednesday', date: new Date('2022-4-6T17:00:00'),
        groupId: 'group4', author: makeMockProfile('Kevin Roberts'),
        desc: 'Come scarf down as much pizza as you can get you hands on!'
    }
];

export function useUserEvents() {
    return useData(
        {
            events: mockEvents
        },
        dispatch => ({}),
        {}
    );
}
