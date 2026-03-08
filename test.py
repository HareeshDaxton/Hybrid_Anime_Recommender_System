from utils.helper import *
from config.path_config import *

#print(getAnimeFeame(48491, DF))

similar_users = find_similar_users(11880, USER_WEIGHTS_PATH, USER2USER_ENCODED, USER2USER_ENCODED)
print(similar_users)
user_pref = get_user_preferences(11880, RATING_DF, DF)
print(user_pref)