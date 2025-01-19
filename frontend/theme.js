import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Jost', sans-serif`, // Font pentru titluri
    body: `'Jost', sans-serif`,   // Font pentru corpul textului
    logo: `'Freeman', sans-serif`,
  },
});

export default theme;
