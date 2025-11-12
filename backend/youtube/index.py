import json
import os
import urllib.request
import urllib.parse
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Fetch videos from YouTube Data API v3
    Args: event - dict with httpMethod, queryStringParameters (q, category, maxResults)
          context - object with request_id, function_name
    Returns: HTTP response with videos list
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    api_key = os.environ.get('YOUTUBE_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'YouTube API key not configured'})
        }
    
    params = event.get('queryStringParameters', {}) or {}
    search_query = params.get('q', 'trending videos')
    category_id = params.get('category', '')
    max_results = params.get('maxResults', '20')
    
    try:
        query_params = {
            'part': 'snippet',
            'q': search_query,
            'type': 'video',
            'maxResults': max_results,
            'key': api_key,
            'order': 'relevance'
        }
        
        if category_id:
            query_params['videoCategoryId'] = category_id
        
        url = f"https://www.googleapis.com/youtube/v3/search?{urllib.parse.urlencode(query_params)}"
        
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
        
        video_ids = [item['id']['videoId'] for item in data.get('items', [])]
        
        if video_ids:
            video_details_params = {
                'part': 'contentDetails,statistics',
                'id': ','.join(video_ids),
                'key': api_key
            }
            
            details_url = f"https://www.googleapis.com/youtube/v3/videos?{urllib.parse.urlencode(video_details_params)}"
            
            req_details = urllib.request.Request(details_url)
            with urllib.request.urlopen(req_details) as response:
                details_data = json.loads(response.read().decode('utf-8'))
            
            details_map = {item['id']: item for item in details_data.get('items', [])}
            
            videos: List[Dict[str, Any]] = []
            for item in data.get('items', []):
                video_id = item['id']['videoId']
                snippet = item['snippet']
                details = details_map.get(video_id, {})
                
                duration = details.get('contentDetails', {}).get('duration', 'PT0S')
                duration_formatted = parse_duration(duration)
                
                view_count = details.get('statistics', {}).get('viewCount', '0')
                view_count_formatted = format_views(int(view_count))
                
                videos.append({
                    'id': video_id,
                    'title': snippet.get('title', ''),
                    'channel': snippet.get('channelTitle', ''),
                    'views': view_count_formatted,
                    'duration': duration_formatted,
                    'thumbnail': snippet.get('thumbnails', {}).get('medium', {}).get('url', ''),
                    'description': snippet.get('description', '')
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'videos': videos})
            }
        else:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'videos': []})
            }
    
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8') if e.fp else str(e)
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': f'YouTube API Error: {error_body}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }


def parse_duration(duration: str) -> str:
    duration = duration.replace('PT', '')
    hours = 0
    minutes = 0
    seconds = 0
    
    if 'H' in duration:
        hours_str, duration = duration.split('H')
        hours = int(hours_str)
    
    if 'M' in duration:
        minutes_str, duration = duration.split('M')
        minutes = int(minutes_str)
    
    if 'S' in duration:
        seconds_str = duration.replace('S', '')
        if seconds_str:
            seconds = int(seconds_str)
    
    if hours > 0:
        return f"{hours}:{minutes:02d}:{seconds:02d}"
    else:
        return f"{minutes}:{seconds:02d}"


def format_views(views: int) -> str:
    if views >= 1_000_000:
        return f"{views / 1_000_000:.1f}M"
    elif views >= 1_000:
        return f"{views / 1_000:.0f}K"
    else:
        return str(views)