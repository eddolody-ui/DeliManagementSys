
import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../components/ui/breadcrumb';
import { Link } from 'react-router-dom';

export function Profile() {
  const { user } = useAuth();

  // Get current path segments for breadcrumb
  const pathname = window.location.pathname;
  const paths = pathname.split('/').filter(Boolean);

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid">
            <div className="w-full grid grid-cols-2">
              <div className="border-b pb-5">
                <p className="text-muted-foreground capitalize">{user.username}</p>
              </div>
              <div className="border-b flex flex-row gap-10 justify-end">
                <div>TimeOff</div><div>date</div>
              </div>  
            </div>
            <div className='grid grid-cols-2 mt-6'>
        <Card>
          <CardContent>
              <div className="flex items-center flex-1 gap-4 mb-4">
                {paths.length > 0 && (
                  <Breadcrumb>
                    <BreadcrumbList>
                      {paths.map((segment, index) => {
                        const href = "/" + paths.slice(0, index + 1).join("/");
                        const isLast = index === paths.length - 1;
                        const label =
                          segment.charAt(0).toUpperCase() + segment.slice(1);

                        return (
                          <BreadcrumbItem key={href}>
                            {isLast ? (
                              <BreadcrumbPage>{label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <Link to={href}>{label}</Link>
                              </BreadcrumbLink>
                            )}
                            {!isLast && <BreadcrumbSeparator />}
                          </BreadcrumbItem>
                        );
                      })}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}
              </div>
              <div>
                <div className='mb-4'>
                  <label className="text-sm font-medium">Username</label>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
                <div className='mb-4'>
                  <label className="text-sm font-medium">User ID</label>
                  <p className="text-sm text-muted-foreground">{user.id}</p>
                </div>
                <div className='mb-4'>
                  <label className="text-sm font-medium">Role</label>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center space-x- justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold capitalize ml-5">{user.username}</h1>
            <Badge variant="secondary" className="ml-5">{user.role}</Badge>
          </div>
        </div>
        </div>        
      </div>
    </div>
  );
}
