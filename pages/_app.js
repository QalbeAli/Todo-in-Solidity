import "../styles/globals.css";

import { TodoListProvider } from "../context/TodoListApp";

const MyApp = ({ Component, pageProps }) => (
  <TodoListProvider>
    <div>
      <Component {...pageProps} />;
    </div>
  </TodoListProvider>
);

export default MyApp;
