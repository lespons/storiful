async function getProps() {
  // const itemTypes = await prisma.itemType.findMany();
  return {
    itemTypes: []
  };
}

export default async function Home() {
  const { itemTypes } = await getProps();
  console.log(itemTypes);

  return null;
}
