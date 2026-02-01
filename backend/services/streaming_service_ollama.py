import json

def streaming_response(current_user: dict,response):
        # first send metadata
        yield json.dumps({
            "user": current_user.username,
            "remaining_credits": current_user.credits,
            "type": "meta"
        }) + "\n"


        full_text = ""

        for chunk in response:
            if 'message' in chunk and 'content' in chunk['message']:
                text = chunk['message']['content']
                full_text += text
                yield json.dumps({
                    "response": text,
                    "type":"chunk"
                }) + "\n"
        yield json.dumps({
            "type" : "end"
        }) + "\n"