from multiprocessing import Process, Queue
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings

process = CrawlerProcess(get_project_settings())
process.crawl("race_crawler", 1)
process.crawl("race_crawler", 2)
process.start()  # the script will block here until the crawling is finished

# import functions_framework
#
# # Register an HTTP function with the Functions Framework
# @functions_framework.http
# def my_http_function(request):
#   def script(queue):
#     try:
#       process = CrawlerProcess(get_project_settings())
#       process.crawl("race_crawler", 1)
#       process.start()  # the script will block here until the crawling is finished
#       queue.put(None)
#     except Exception as e:
#       queue.put(e)
#   queue = Queue()
#
#   main_process = Process(target=script, args=(queue,))
#   main_process.start()
#   main_process.join()
#
#   result = queue.get()
#   if result is not None:
#     raise result
#
#   # Return an HTTP response
#   return 'OK'