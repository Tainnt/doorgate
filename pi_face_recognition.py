# USAGE
# python pi_face_recognition.py --cascade haarcascade_frontalface_default.xml --encodings encodings.pickle

# import the necessary packages
from imutils.video import VideoStream
from imutils.video import FPS
import face_recognition
import argparse
import imutils
import pickle
import time
import cv2
import sys

# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-c", "--cascade", required=True,
	help = "path to where the face cascade resides")
ap.add_argument("-e", "--encodings", required=True,
	help="path to serialized db of facial encodings")
ap.add_argument("-C", "--candidate", required=True,
	help = "index number of the potential candidate")
args = vars(ap.parse_args())

# load the known faces and embeddings along with OpenCV's Haar
# cascade for face detection
print("[INFO] loading encodings + face detector...")
data = pickle.loads(open(args["encodings"], "rb").read())

detector = cv2.CascadeClassifier(args["cascade"])

# stay here until tenant's rfid/id is received
#print("sys.argv[1] = " + sys.argv[1])
#print("sys.argv[2] = " + sys.argv[2])
#print("sys.argv[3] = " + sys.argv[3])
#print("sys.argv[4] = " + sys.argv[4])
#print("sys.argv[5] = " + sys.argv[5])
#print("sys.argv[6] = " + sys.argv[6])
# while sys.argv[1] < 1:


# initialize the video stream and allow the camera sensor to warm up
print("[INFO] starting video stream...")
vs = VideoStream(src=0).start()
#vs = VideoStream(usePiCamera=True).start()
time.sleep(2.0)

# start the FPS counter
fps = FPS().start()

## IDs for list of tenants

phuc_id = [i for i in range(0, 7)]
kha_id = [i for i in range(7, 14)]
ian_malcolm_id = [i for i in range(14, 21)]
phase_id = [i for i in range(21, 29)]
linh_id = [i for i in range(29, 39)]
nhat_id = [i for i in range(39, 45)]

candidate = []

if sys.argv[6] == "1":
	candidate = phuc_id
	print("candidate: Phuc")
elif sys.argv[6] == "2":
	candidate = kha_id
	print("candidate: Kha")
elif sys.argv[6] == "3":
	candidate = ian_malcolm_id
	print("candidate: ian_malcolm")
elif sys.argv[6] == "4":
	candidate = phase_id
	print("candidate: Phase")
elif sys.argv[6] == "5":
	candidate = linh_id
	print("candidate: Linh")
elif sys.argv[6] == "6":
	candidate = nhat_id
	print("candidate: Nhat")
##




# loop over frames from the video file stream
while True:
	# grab the frame from the threaded video stream and resize it
	# to 500px (to speedup processing)
	frame = vs.read()
	frame = imutils.resize(frame, width=500)

	# convert the input frame from (1) BGR to grayscale (for face
	# detection) and (2) from BGR to RGB (for face recognition)
	gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
	rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

	# detect faces in the grayscale frame
	rects = detector.detectMultiScale(gray, scaleFactor=1.1, 
		minNeighbors=5, minSize=(30, 30),
		flags=cv2.CASCADE_SCALE_IMAGE)

	# OpenCV returns bounding box coordinates in (x, y, w, h) order
	# but we need them in (top, right, bottom, left) order, so we
	# need to do a bit of reordering
	boxes = [(y, x + w, y + h, x) for (x, y, w, h) in rects]

	# compute the facial embeddings for each face bounding box in the image
	encodings = face_recognition.face_encodings(rgb, boxes)
	customized_encodings = [data["encodings"][i] for i in candidate]

	names = []

	for encoding in encodings:
		matches = face_recognition.compare_faces(customized_encodings, encoding)

#		matches = face_recognition.compare_faces(data["encodings"],
#			encoding)
		name = "Unknown"

		# check to see if we have found a match
		if True in matches:
			# find the indexes of all matched faces then initialize a
			# dictionary to count the total number of times each face
			# was matched
			matchedIdxs = [i for (i, b) in enumerate(matches) if b]
			counts = {}
			print("\nmatched indexes compared to customized_encodings:")
			print(matchedIdxs)
			# loop over the matched indexes and maintain a count for
			# each recognized face face
			for i in matchedIdxs:
				name = data["names"][i+candidate[0]]
				counts[name] = counts.get(name, 0) + 1

			# determine the recognized face with the largest number
			# of votes (note: in the event of an unlikely tie Python
			# will select first entry in the dictionary)

			print("dictionary counts: ")
			print(counts)

			if counts[name] < ((candidate[-1] - candidate[0] + 1) / 2):
				name = "Unknown"
#			name = max(counts, key=counts.get)
		
		# update the list of names
		names.append(name)

	# loop over the recognized faces
	for ((top, right, bottom, left), name) in zip(boxes, names):
		# draw the predicted face name on the image
		cv2.rectangle(frame, (left, top), (right, bottom),
			(0, 255, 0), 2)
		y = top - 15 if top - 15 > 15 else top + 15
		cv2.putText(frame, name, (left, y), cv2.FONT_HERSHEY_SIMPLEX,
			0.75, (0, 255, 0), 2)

	# display the image to our screen
	cv2.imshow("Frame", frame)
	key = cv2.waitKey(1) & 0xFF

	if name != "Unknown":
		print("Step 2 Granted!")
	else:
		print("Step 2 Denied!")
	time.sleep(2)
	vs.stop()
	cv2.destroyAllWindows()
	exit()
	# if the `q` key was pressed, break from the loop
	if key == ord("q"):
		break

	# update the FPS counter
	fps.update()

# stop the timer and display FPS information
fps.stop()
#print("[INFO] elasped time: {:.2f}".format(fps.elapsed()))
#print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))

# do a bit of cleanup
cv2.destroyAllWindows()
vs.stop()
