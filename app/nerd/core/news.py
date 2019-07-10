from mongoengine import NotUniqueError
from newsapi import NewsApiClient
from newsapi.newsapi_exception import NewsAPIException

from nerd.core.document.corpus import Text


def add_headlines(headlines):
    titles = [Text(value=headline['title']) for headline in headlines]
    descriptions = [Text(value=headline['description']) for headline in headlines]
    texts = titles + descriptions
    added = 0
    for text in texts:
        try:
            text.save()
            added = added + 1
        except NotUniqueError:
            pass
    return added


class NewsApi:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def fetch_news(self, pages: int = 1):
        client = NewsApiClient(api_key=self.api_key)
        added = 0
        for page in range(1, pages + 1):
            try:
                response = client.get_top_headlines(sources='google-news-ar', page_size=100, page=page)
                added = added + add_headlines(response['articles'])
            except NewsAPIException:
                pass
        print(f"Added {added} news.")
