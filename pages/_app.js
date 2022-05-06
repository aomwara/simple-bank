import { ChakraProvider } from "@chakra-ui/react";
import { Provider as ReduxProvider } from "react-redux";
import { SimpleBankProvider } from "../contexts/SimpleBankContext";
import store from "../store";

import Nav from "../components/Utils/Navbar/Navbar";
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/montserrat/400.css";
import "@fontsource/inter/400.css";
import theme from "../theme";

import { Footer } from "../components/Utils/Footer/Footer";

function App({ Component, pageProps }) {
  return (
    <ReduxProvider store={store}>
      <ChakraProvider theme={theme}>
        <SimpleBankProvider>
          <Nav />
          <Component {...pageProps} />
          <Footer />
        </SimpleBankProvider>
      </ChakraProvider>
    </ReduxProvider>
  );
}

export default App;
