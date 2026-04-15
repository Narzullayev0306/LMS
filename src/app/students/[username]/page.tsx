import PublicProfile from "@/components/PublicProfile";

export default async function StudentDetails({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const decodedUsername = decodeURIComponent(resolvedParams.username);
  
  return (
    <div className="w-full relative animate-in fade-in zoom-in-95 duration-500">
       <PublicProfile targetUsername={decodedUsername} />
    </div>
  );
}
