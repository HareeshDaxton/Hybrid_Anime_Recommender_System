from setuptools import setup, find_packages

with open('requirements.txt') as f:
    requirements = f.read().splitlines()
    
setup(
    name='Hybrid_Anime_Recommendation_System',
    version='0.2',
    author='Hareesh Kumar',
    package_data=find_packages(),
    install_requires=requirements
    
)