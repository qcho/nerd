from mongoengine import NotUniqueError
from newsapi import NewsApiClient
from newsapi.newsapi_exception import NewsAPIException

from nerd.core.document.corpus import Text


def add_headlines(headlines):
    texts = [Text(value=headline['description']) for headline in headlines]
    for text in texts:
        try:
            # TODO: Can't use bulk-insert since continue_on_error isn't supported yet:
            #           Text.objects.insert(texts)
            text.save()
        except NotUniqueError:
            pass


class NewsApi:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def fetch_news(self, pages: int = 1):
        client = NewsApiClient(api_key=self.api_key)
        for page in range(1, pages + 1):
            try:
                response = client.get_top_headlines(country='ar', page_size=100, page=page)
                add_headlines(response['articles'])
            except NewsAPIException:
                pass

