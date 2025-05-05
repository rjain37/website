import "styles/globals.css";
import "styles/animation.css";
import "styles/typography.css";
import "styles/components.css";
import { ColorModeProvider } from "@/hooks/useColorMode";
import { AppProps } from "next/app";
import { useRemoteRefresh } from "next-remote-refresh/hook";
import { SessionProvider } from "next-auth/react";

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useRemoteRefresh();
  return (
    <SessionProvider session={session}>
      <ColorModeProvider>
        <Component {...pageProps} />
      </ColorModeProvider>
    </SessionProvider>
  );
}

export default App;
