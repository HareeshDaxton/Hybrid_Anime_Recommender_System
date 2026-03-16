from utils.common_functions import read_yaml_file
from config.path_config import *
from src.data_preprocessing.data_processing import DataPreprocessing
from src.model_training.model_training import ModeTraining

if __name__ == '__main__':
    
    data_process =DataPreprocessing(ANIMELIST_CSV, PROCESSED_DIR)
    data_process.run()
    
    model_train = ModeTraining(PROCESSED_DIR)
    model_train.train_model()
    