'use server';

async function getProps() {
  return {};
}

export default async function OrderHome() {
  return (
    <div className="flex flex-row gap-4 justify-center">
      <dotlottie-player
        src="https://lottie.host/e938c02d-3fe3-4f4c-bd3d-56d7c3c039a0/Sw5KcAxpW9.json"
        background="transparent"
        speed={1}
        style={{ width: '300px', height: '300px' }}
        loop
        autoplay></dotlottie-player>
    </div>
  );
}
