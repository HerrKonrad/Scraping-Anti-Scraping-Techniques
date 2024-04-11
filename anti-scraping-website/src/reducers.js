const initialState = {
    data: []
  };
  
  const rootReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'FETCH_DATA':
        return {
          ...state,
          data: action.payload // Here we are updating the state with the fetched data
        };
      default:
        return state;
    }
  };

  export const fetchData = (data) => {
    return {
      type: 'FETCH_DATA',
      payload: data
    };
  };
  
  export default rootReducer;