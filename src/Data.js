import { useReducer, useMemo } from 'react';

function createMockProfile() {
    return {
        name: 'John Douglas',
        avatarSrc: '/images/avatar.png'
    };
}

/// The is the main reducer function that processes messages that indicate that part of the state of the application should change
function processMessage(oldState, msg) {
    console.log('recieved message: ', msg);

    // first element in `msg` is the name of a function in this object,
    // the rest of the elements of `msg` are passed as arguments to the member function
    // these functions only return the state that they have modified, and it is merged afterwards
    const handler = ({
        login: () => ({ signedIn: true, profile: createMockProfile() }),
        logout: () => ({ signedIn: false, profile: null }),
    })[msg[0]];

    if(!handler) throw msg;

    return {
        ...oldState,
        ...(handler.apply(null, msg.slice(1)))
    };
}

/// This function creates the functions that will be added to the data object returned from `useData`
/// These are API functions that modify or process data in some way.
/// After finishing whatever processing, the function will eventually call `dispatch` with a message array that tells the reducer how to change the state
function createApi(dispatch) {
    return {
        async login(username, password) {
            dispatch(['login']);
        },
        async logout() {
            dispatch(['logout']);
        }
    };
}

/// The main data-store hook. should only happen once in <App/>
export function useData() {
    const [data, dispatch] = useReducer(
        processMessage,
        {
            signedIn: false
        }
    );

    const apiFuncs = useMemo(() => createApi(dispatch), [dispatch]);

    return {...data, ...apiFuncs};
}
