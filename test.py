from utils.helper import *
from config.path_config import *
from pipelines.prediction_pipeline import hybrid_recommendation
from dotenv import load_dotenv
load_dotenv()
#print(getAnimeFeame(48491, DF))

# similar_users = find_similar_users(11880, USER_WEIGHTS_PATH, USER2USER_ENCODED, USER2USER_ENCODED)
# print(similar_users)
# user_pref = get_user_preferences(11880, RATING_DF, DF)
# print(user_pref)

#print(hybrid_recommendation(11880))

#print(find_similar_animes('Fairy Tail', ANIME_WEIGHTS_PATH, ANIME2ANIME_ENCODED, ANIME2ANIME_DECODED, DF))

# API = os.environ.get("COMET_API_KEY")
# print(API)