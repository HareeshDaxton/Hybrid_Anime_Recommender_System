import os
import pandas as pd
from src.logging.logger import get_logger
from src.exception.custom_exception import CustomException
import yaml

logging = get_logger(__name__)

def read_yaml_file(file_path: str):
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f'the given file is not present in path')
        
        with open(file_path, 'r') as file:
            config = yaml.safe_load(file)
            logging.info(f"Successfully read the YAML file")
            return config
    except Exception as e:
        logging.error(f"Error occurred while reading YAML file")
        raise CustomException('Failed to YAML ', e)
    
def load_data(path):
    try:
        logging.info(f'Loading data from {path}')
        return pd.read_csv(path)
    except Exception as e:
        logging.info('Error occured while the loding the data')
        raise CustomException('Failed to load the data', e)