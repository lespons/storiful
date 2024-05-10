import su from 'superjson';

export const fetcher = <T>(url: string): Promise<T | any> =>
  fetch(url)
    .then((res) => res.text())
    .then((text) => su.parse(text));
// export const fetcher = async (url: string) => {
//   // Introduce a delay of 2 seconds
//   await new Promise((resolve) => setTimeout(resolve, 2000));
//
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error('Network response was not ok');
//   }
//   return response.json();
// };
