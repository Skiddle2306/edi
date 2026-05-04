import urllib.request
import threading
import time

# Configuration
URL = "http://localhost:80"
TOTAL_REQUESTS = 200

def send_request():
    try:
        # Standard library request
        with urllib.request.urlopen(URL) as response:
            status = response.getcode()
    except Exception as e:
        pass # Handle errors if the server blocks you

def run_test():
    threads = []
    
    print(f"Firing {TOTAL_REQUESTS} requests...")
    start_time = time.perf_counter()

    # Create 200 threads
    for _ in range(TOTAL_REQUESTS):
        t = threading.Thread(target=send_request)
        t.start()
        threads.append(t)

    # Wait for all threads to finish
    for t in threads:
        t.join()

    end_time = time.perf_counter()
    duration = end_time - start_time
    
    print(f"Finished in {duration:.2f} seconds")
    print(f"Requests per second: {TOTAL_REQUESTS / duration:.2f}")

if __name__ == "__main__":
    run_test()