import { Card, CardHeader } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"

export default function AdminDashboard() {
  return (
    <>
      <PageHeader 
        title="Dashboard" 
        description="Tổng quan hệ thống SCEI"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <div className="text-sm font-medium text-muted-foreground">
              Pending Applications
            </div>
            <div className="mt-2 text-3xl font-bold">15</div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-medium text-muted-foreground">
              Upcoming Events
            </div>
            <div className="mt-2 text-3xl font-bold">5</div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-medium text-muted-foreground">
              New Inquiries
            </div>
            <div className="mt-2 text-3xl font-bold">12</div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-medium text-muted-foreground">
              Total Startups
            </div>
            <div className="mt-2 text-3xl font-bold">150</div>
          </CardHeader>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </CardHeader>
        <div className="p-6 pt-0">
          <p className="text-sm text-muted-foreground">
            Chưa có dữ liệu. Hệ thống đang được phát triển.
          </p>
        </div>
      </Card>
    </>
  )
}