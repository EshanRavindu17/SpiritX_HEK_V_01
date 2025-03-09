const initialState = {
    user: null, // or an empty object if preferred
  };
  


const userAuthReducer =(state=initialState,action)=>{

    switch(action.type){
        case "SET_USER" :
            return{
                ...state,
                user:action.user,
            };
            case "SET_USER_NULL" :
                return{
                    ...state,
                    user:null,
                };   
                case "UPDATE_USER":
                    return {
                        ...state,
                        user: {
                        ...state.user, // Keep existing fields
                        ...action.updatedFields, // Overwrite with updated fields
                        },
                    };
                default:
                    return state; 
    }
 
};
export default userAuthReducer