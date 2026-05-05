import { Stack } from "expo-router";
import "../global.css"
import {  QueryClientProvider,  QueryClient,} from "@tanstack/react-query"

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{headerShown:false}} />
    </QueryClientProvider>
  );
}
