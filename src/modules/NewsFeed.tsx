import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  CircularProgress,
} from "@mui/material";

import PFADeskPDFUploadButton from "./UploadPFAdeskPdf";

interface NewsItem {
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  link: string;
  comment?: string;
}

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  function getIndianDateTime(timestampStr: string): string {
    const timestamp = Number(timestampStr);
    return new Date(timestamp).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  const downloadAndOpenPdf = async (pdfUrl: string, fileName: string) => {
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Failed to fetch PDF");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // 1️⃣ Open in new tab
      window.open(objectUrl, "_blank");

      // 2️⃣ Trigger download
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
    } catch (err) {
      console.error("Error opening/downloading PDF:", err);
    }
  };

  const fetchNews = useCallback(async () => {
      try {
        const baseUrl = "https://pfadesk.blob.core.windows.net/nwr";
        const sasToken =
          "sp=rw&st=2025-12-01T08:17:09Z&se=2025-12-31T16:32:09Z&spr=https&sv=2024-11-04&sr=c&sig=bim3iwFS0tD%2F7cng0CMNw6i6wzHQMr3i5JLjHd6hQKc%3D";

        const containerUrl = `${baseUrl}?restype=container&comp=list&${sasToken.replace(
          /^\?/,
          ""
        )}`;
        const response = await fetch(containerUrl);
        const text = await response.text();

        const results: NewsItem[] = [];
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");
        const blobs = xmlDoc.getElementsByTagName("Name");

        let urls: string[] = [];
        for (let i = 0; i < blobs.length; i++) {
          urls.push(
            `${baseUrl}/${blobs[i].textContent}?${sasToken.replace(
              /^\?/,
              ""
            )}`
          );
        }
        urls.reverse();

        console.log("urls", urls)

        for (let url of urls) {
          const fileName = url.split("/").pop() || "";
          // console.log("filename", fileName)
          const originalName1 = fileName.substring(fileName.indexOf("-") + 1);
          // console.log("originalname", originalName1)
          const originalName = originalName1.split("?")[0];
          // console.log("name",originalName)
          const publishedAt = fileName.split("-")[0] ?? "";

          const [blobUrl, queryString] = url.split("?");
          const metadataUrl = `${blobUrl}?comp=metadata&${queryString}`;

          const metadataResponse = await fetch(metadataUrl, {
            method: "HEAD", // 🔥 better to use HEAD
            headers: {
              "x-ms-version": "2020-10-02",
            },
          });

          let comment: string | undefined = undefined;
          if (metadataResponse.ok) {
            // Azure always stores metadata keys in lowercase
            const metaComment = metadataResponse.headers.get("x-ms-meta-comment");
            if (metaComment) comment = decodeURIComponent(metaComment);
          }

          console.log("metadta",comment)

          results.push({
            title: originalName,
            publishedAt: getIndianDateTime(publishedAt),
            description: "",
            source: "",
            link: url,
            comment,
          });
        }

        console.log("results", results)

        setNews(results);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchNews();
  }, [fetchNews]);

  return (
    <Box
      sx={{
        background: "rgba(56, 38, 96, 0.9)",
        border: "1px solid #B72BF8",
        borderRadius: 2,
        height: "95%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ textAlign: "center", color: "white" }}>
          PFA Desk
        </Typography>
        <PFADeskPDFUploadButton onUploaded={() => {
          setLoading(true);
          fetchNews();
        }} />
      </Box>

      <List
        dense
        sx={{
          px: 1,
          overflowY: "auto",
          flex: 1,
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              py: 5,
            }}
          >
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          news.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <Card
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    width: "100%",
                    boxShadow: "none",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      component="span"
                      onClick={() => downloadAndOpenPdf(item.link, item.title)}
                      sx={{
                        textDecoration: "underline",
                        color: "white",
                        cursor: "pointer",
                        "&:hover": {
                          color: "#B72BF8",
                        },
                      }}
                    >
                      {item.title}
                    </Typography>

                    {item.comment && (
                      <Typography
                        variant="body2"
                        color="rgba(255,255,255,0.8)"
                        sx={{ mt: 1 }}
                      >
                        {item.comment}
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {item.publishedAt}
                    </Typography>
                  </CardContent>
                </Card>
              </ListItem>
              {index < news.length - 1 && (
                <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />
              )}
            </React.Fragment>
          ))
        )}
      </List>
    </Box>
  );
};

export default NewsFeed;
