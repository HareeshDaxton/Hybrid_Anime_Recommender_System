import os
import sys
import comet_ml
import joblib
import numpy as np
from tensorflow.keras.callbacks import ModelCheckpoint,LearningRateScheduler,TensorBoard,EarlyStopping
from src.logging.logger import get_logger
from src.exception.custom_exception import CustomException
from src.base_model import BaseModel
from config.path_config import *

logger = get_logger(__name__)

class ModeTraining:
    def __init__(self, data_path):
        self.data_path = data_path
        logger.info("Model Training & COMET ML initialized..")
    
    def load_data(self):
        try:
            
            x_train_arr = joblib.load(X_TRAIN_ARRAY)
            x_test_arr = joblib.load(X_TEST_ARRAY)
            y_train = joblib.load(Y_TRAIN)
            y_test = joblib.load(Y_TEST)
            
            logger.info("Data loaded sucesfully for Model Trainig")
            return x_train_arr, x_test_arr, y_train, y_test
        
        except Exception as e:
            raise CustomException("Failed to load data",e)
        
        
    def train_model(self):
        try:
            x_train_arr, x_test_arr, y_train, y_test = self.load_data()
            
            n_users = len(joblib.load(USER2USER_ENCODED))
            n_anime = len(joblib.load(ANIME2ANIME_ENCODED))
    
            base_model = BaseModel(config_path=CONFIG_PATH)
            
            model = base_model.RecommenderNet(n_users=n_users, n_anime=n_anime)
            
            start_lr = 0.0001
            min_lr = 0.0001
            max_lr = 0.00005
            batch_size = 10000

            ramup_epchs = 5
            sustain_epochs = 0
            exp_decat = 0.8
            
            def irfn(epoch):   #IT helps to find the best learining rate "Took from stack overflow..."
                if epoch < ramup_epchs:
                    return (max_lr - start_lr) / ramup_epchs * epoch + start_lr
                
                elif epoch < ramup_epchs + sustain_epochs:
                    return max_lr
                
                else:
                    return (max_lr - min_lr) * exp_decat ** (epoch - ramup_epchs - sustain_epochs) + min_lr
                
                
            lr_callback = LearningRateScheduler(lambda epoch : irfn(epoch), verbose=0)

            model_checkpoint = ModelCheckpoint(filepath=CHECKPOINT_FILE_PATH, save_weights_only=True, monitor='val_loss', save_best_only=True)

            early_stopping = EarlyStopping(patience=3, monitor='val_loss', mode='min', restore_best_weights=True)
            
            my_call_back = [model_checkpoint, lr_callback, early_stopping]
            
            os.makedirs(os.path.dirname(CHECKPOINT_FILE_PATH), exist_ok=True)
            os.makedirs(MODEL_DIR, exist_ok=True)
            os.makedirs(WEIGHTS_DIR, exist_ok=True)
            
            try:
                
                history = model.fit(
                x=x_train_arr,
                y=y_train,
                batch_size=batch_size,
                epochs=20,
                verbose=1,
                validation_data=(x_test_arr, y_test),
                callbacks=my_call_back
                )
            
                model.load_weights(CHECKPOINT_FILE_PATH)
                logger.info("Model training Completedd.....") 

            except Exception as e:
                raise CustomException("Model training failedd.....")
            
            self.save_model_weights(model)
            
        except Exception as e:
            logger.error(str(e))
            raise CustomException("Errorduring Model Trainig Process",e)
                
    
    def extract_weights(self, layer_name, model):
        try:
            weights_layer = model.get_layer(layer_name)
            weights = weights_layer.get_weights()[0]
            weights = weights / np.linalg.norm(weights,axis=1).reshape((-1, 1))

            logger.info(f"Extracting weights for {layer_name}")
            return weights
        
        except Exception as e:
            logger.error(str(e))
            raise CustomException("Errorduring Weight Extraction Process",e)
    
            
    def save_model_weights(self, model):
        try:
            
            model.save(MODEL_PATH)
            logger.info(f"Model saved to {MODEL_PATH}")
            
            user_weights = self.extract_weights('user_weights', model)
            anime_weights = self.extract_weights('anime_weights', model)
            
            joblib.dump(user_weights, USER_WEIGHTS_PATH)
            joblib.dump(anime_weights, ANIME_WEIGHTS_PATH)
            
        
            logger.info("User and Anime weights saved sucesfully....")
        except Exception as e:
            logger.error(str(e))
            raise CustomException("Error during saving model and weights Process",e)
            
            
if __name__ == '__main__':
    model_train = ModeTraining(PROCESSED_DIR)
    model_train.train_model()
    