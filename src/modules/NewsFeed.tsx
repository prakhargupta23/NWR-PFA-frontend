import React, { useEffect, useState } from "react";
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

interface NewsItem {
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  link: string;
}

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://api.thenewsapi.com/v1/news/all?api_token=j4YeXQmMNtWhsobLh7Uqe7LdyRustvLb6HBWyW1x&search=%22Indian%20Railways%22%20OR%20IRCTC&language=en&limit=10`
        );
        const data = await response.json();

        const formattedNews = data.data.map((item: any) => ({
          title: item.title,
          description: item.description,
          source: item.source,
          publishedAt: new Date(item.published_at).toDateString(),
          link: item.url,
        }));

        setNews(formattedNews);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

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
      <Box sx={{ py: 2, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
        <Typography variant="h6" sx={{ textAlign: "center", color: "white" }}>
          News Feed
        </Typography>
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
                      component="a"
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
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

                    {/* <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: "#aaa",
                        mt: 0.5,
                        wordBreak: "break-all",
                      }}
                    >
                      {item.link}
                    </Typography> */}

                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,0.8)"
                      sx={{ mt: 1 }}
                    >
                      {item.description}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {item.source} • {item.publishedAt}
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
