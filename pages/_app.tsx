import type { AppProps } from 'next/app';
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';
import '../styles/globals.css';
import ApiProvider from '../context/ApiContext';

const activeChainId = ChainId.Rinkeby;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={activeChainId}>
      <ApiProvider>
        <Component {...pageProps} />
      </ApiProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
