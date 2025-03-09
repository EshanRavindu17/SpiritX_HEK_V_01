import{createStore} from "redux";
import myReducer from "./actions/reducers/index";

const Store = createStore(myReducer);
export default Store;


