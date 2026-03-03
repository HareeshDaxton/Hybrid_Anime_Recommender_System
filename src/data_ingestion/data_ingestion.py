import os
import sys
import pandas as pd
from google.cloud import storage
from src.logging.logger import get_logger
from src.exception.custom_exception import CustomException
from config.path_config import *
from utils.common_functions import *

logger = get_logger(__name__)

class DataIngestion:
    def __init__(self, config):
        self.config = config['data_ingestion']
        self.bucket_name = self.config['bucket_name']
        self.bucket_file_name = self.config['bucket_file_names']
        
        os.makedirs(RAW_DIR, exist_ok=True)
        
        logger.info('Data Ingestion started...')
        
    def download_csv_from_gcp(self):
        try:
            client = storage.Client.from_service_account_json("C:/Users/Hareesh/Downloads/anime-recommendation-489009-3ee222bb74e3.json")
            bucket = client.bucket(self.bucket_name)
            
            for file_name in self.bucket_file_name:
                file_path = os.path.join(RAW_DIR, file_name)
                
                if file_name == 'animelist.csv':
                    blob = bucket.blob(file_name)
                    blob.download_to_filename(file_path)
                    
                    data = pd.read_csv(file_path, nrows=5000000)
                    data.to_csv(file_path, index=False)                    
                    
                    logger.info('Large file detected only downloading 5M rows...')

                else:
                    blob = bucket.blob(file_name)
                    blob.download_to_filename(file_path)
                    
                    logger.info('Downloading small files anime.csv and anime_with_synopis')
                    
        except Exception as e:
            logger.error('Error while downlodaing the from the GCP ')
            raise CustomException('Failed to downloade the data', sys)
        
        
    def run_data_ingestion(self):
        try:
            logger.info('Started data ingestion')
            self.download_csv_from_gcp()
            logger.info('Data ingestion completed ')
        
        except Exception as e:
            raise CustomException(f'CustomException : {str(e)}', sys)
        
        finally:
            logger.info('Data Ingestion DONE....')
            
            
if __name__ == '__main__':
    data_ingestion = DataIngestion(read_yaml_file(CONFIG_PATH))
    data_ingestion.run_data_ingestion()