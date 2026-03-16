from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input,Embedding,Dot,Flatten,Dense,Activation,BatchNormalization, Dropout
from utils.common_functions import read_yaml_file
import tensorflow as tf
from src.logging.logger import get_logger
from src.exception.custom_exception import CustomException

logger = get_logger(__name__)


def rmse(y_true, y_pred):
    return tf.sqrt(tf.reduce_mean(tf.square(y_true - y_pred)))

def r2_score(y_true, y_pred):
    ss_res = tf.reduce_sum(tf.square(y_true - y_pred))
    ss_tot = tf.reduce_sum(tf.square(y_true - tf.reduce_mean(y_true)))
    return 1 - (ss_res / (ss_tot + tf.keras.backend.epsilon()))


class BaseModel:
    
    def __init__(self, config_path):
        try:
            self.config = read_yaml_file(config_path)
            logger.info("Loaded configuration from config.yaml")
            
        except Exception as e:
            raise CustomException("Error loading configuration",e)
        
    def RecommederNet(self, n_users, n_anime):
        try:
            
            embeddin_size = self.config['model']['embedding_size']
            
            user = Input(name='user', shape=[1])
            user_embedding = Embedding(name='user_embedding', input_dim=n_users, output_dim=embeddin_size)(user)
            
            anime = Input(name='anime', shape=[1])
            anime_embeddding = Embedding(name='anime_embedding', input_dim=n_anime, output_dim=embeddin_size)(anime)
            
            x = Dot(name='dot_prodict', normalize=True, axes=2)([user_embedding, anime_embeddding])
            
            x = Flatten()(x)
            
            x = Dense(256, kernel_initializer='he_normal')(x)
            x = BatchNormalization()(x)
            x = Activation('relu')(x)
            x = Dropout(0.4)(x)

            x = Dense(128, kernel_initializer='he_normal')(x)
            x = BatchNormalization()(x)
            x = Activation('relu')(x)
            x = Dropout(0.3)(x)
            
            x = Dense(128, kernel_initializer='he_normal')(x)
            x = BatchNormalization()(x)
            x = Activation('relu')(x)
            x = Dropout(0.3)(x)
            
            x = Dense(64, kernel_initializer='he_normal')(x)
            x = BatchNormalization()(x)
            x = Activation('relu')(x)
            x = Dropout(0.3)(x)
            
            x = Dense(64, kernel_initializer='he_normal')(x)
            x = BatchNormalization()(x)
            x = Activation('relu')(x)
            x = Dropout(0.3)(x)

            x = Dense(32, kernel_initializer='he_normal')(x)
            x = BatchNormalization()(x)
            x = Activation('relu')(x)

            output = Dense(1, activation="linear")(x)
            
            model = Model(inputs=[user, anime], outputs=output )
            model.compile(
                loss= self.config['model']['loss'], 
                optimizer= self.config['model']['optimizer'], 
                metrics= self.config['model']['metrics'] + [r2_score,rmse]
                )
            
            logger.info("Model created sucesfully....")
            return model
            
        except Exception as e:
            logger.error(f"Error occurfed during model architecture {e}")
            raise CustomException("Failed to create model",e)