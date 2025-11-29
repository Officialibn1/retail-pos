"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./index";

/**
 * Redux Provider component that wraps the application
 *
 * This component provides the Redux store to all child components,
 * enabling them to access state and dispatch actions.
 *
 * PersistGate delays rendering until the persisted state has been
 * retrieved and saved to redux.
 *
 * Must be a client component since Redux requires client-side JavaScript.
 *
 * Requirements: 1.5, 8.3, 8.4
 *
 * @param children - React children to be wrapped with Redux Provider
 */
export function ReduxProvider({ children }: { children: React.ReactNode }) {
	return (
		<Provider store={store}>
			<PersistGate
				loading={null}
				persistor={persistor}>
				{children}
			</PersistGate>
		</Provider>
	);
}
