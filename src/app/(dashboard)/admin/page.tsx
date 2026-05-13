import { getXlsxMetadata } from "@/lib/xlsx-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XlsxUploader } from "./xlsx-uploader";

export default async function AdminPage() {
  const meta = await getXlsxMetadata();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">데이터 관리</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">XLSX 파일 업로드</CardTitle>
        </CardHeader>
        <CardContent>
          <XlsxUploader />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">현재 데이터 파일 정보</CardTitle>
        </CardHeader>
        <CardContent>
          {meta?.exists ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">파일 크기</span>
                  <p className="font-medium">{meta.sizeKB} KB</p>
                </div>
                <div>
                  <span className="text-muted-foreground">최종 수정</span>
                  <p className="font-medium">
                    {new Date(meta.lastModified).toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground mb-2 block">
                  시트별 데이터
                </span>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {meta.sheets.map((sheet) => (
                    <div
                      key={sheet.name}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <span className="text-xs font-medium">{sheet.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {sheet.rows}행
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              데이터 파일이 없습니다. XLSX 파일을 업로드해주세요.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
