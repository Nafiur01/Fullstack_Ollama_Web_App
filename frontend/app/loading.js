export default function Loading() {
  return (
    <div className="flex w-full min-h-screen justify-center items-center">
      <div className="flex w-max gap-4 justify-center items-center relative">
        <div className="text-3xl animate-pulse">Loading</div>
        <div className="rounded-md h-12 w-12 border-4 border-t-4 border-blue-500 animate-spin"></div>
      </div>
    </div>
  );
}
