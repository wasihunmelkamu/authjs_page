import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Children, useState } from "react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClinet] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: { staleTime: 5 * 60 * 1000 },
      },
    })
  )
  return(

    <QueryClientProvider client={queryClinet}>{children}</QueryClientProvider>
  )
};

export default Providers