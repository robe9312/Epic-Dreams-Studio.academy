# backend/app/services/youtube_service.py
import os
import google.oauth2.credentials
import google.auth.transport.requests
import googleapiclient.discovery
from googleapiclient.http import MediaFileUpload

class YouTubeService:
    def __init__(self):
        self.client_id = os.getenv("YT_CLIENT_ID")
        self.client_secret = os.getenv("YT_CLIENT_SECRET")
        self.refresh_token = os.getenv("YT_REFRESH_TOKEN")
        self.api_service_name = "youtube"
        self.api_version = "v3"

    def _get_credentials(self):
        """Obtiene credenciales OAuth2 usando el refresh token."""
        creds = google.oauth2.credentials.Credentials(
            None,
            refresh_token=self.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=self.client_id,
            client_secret=self.client_secret
        )
        # Refrescar el token (necesario para obtener un access_token válido)
        creds.refresh(google.auth.transport.requests.Request())
        return creds

    def upload_video(self, file_path, title, description, privacy_status="unlisted"):
        """
        Sube un video a YouTube.
        - file_path: ruta local al archivo de video.
        - title: título del video.
        - description: descripción.
        - privacy_status: 'public', 'private', 'unlisted'.
        """
        creds = self._get_credentials()
        youtube = googleapiclient.discovery.build(
            self.api_service_name, self.api_version, credentials=creds)

        body = {
            'snippet': {
                'title': title,
                'description': description,
                'tags': [],
                'categoryId': '22'  # People & Blogs
            },
            'status': {
                'privacyStatus': privacy_status
            }
        }

        media = MediaFileUpload(file_path, chunksize=-1, resumable=True)
        request = youtube.videos().insert(
            part='snippet,status',
            body=body,
            media_body=media
        )
        response = request.execute()
        return {
            "video_id": response["id"],
            "url": f"https://www.youtube.com/watch?v={response['id']}"
        }